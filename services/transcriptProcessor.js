const OpenAI = require('openai');
const db = require('../db');
const axios = require('axios');
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;

class JiraClient {
    constructor() {
        this.baseUrl = null;
        this.headers = null;
    }

    setConfig(config) {
        console.log('Setting Jira configuration for host:', config.host);
        this.baseUrl = `https://${config.host}/rest/api/3`;
        this.headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.accessToken}`
        };
    }

    async searchJira(jql, options = {}) {
        if (!this.baseUrl || !this.headers) {
            console.error('Jira configuration not set');
            throw new Error('Jira configuration not set. Call setConfig first.');
        }

        try {
            console.log('Searching Jira with JQL:', jql);
            const response = await axios.post(
                `${this.baseUrl}/search/jql`,
                {   
                    jql: jql,
                    maxResults: 50,
                    fields: ['summary', 'description', 'comment']
                },
                {
                    headers: this.headers
                }
            );
            
            console.log(`Found ${response.data.issues?.length || 0} Jira issues`);
            return response.data;
        } catch (error) {
            console.error('Error searching Jira:', error.response?.data || error.message);
            throw error;
        }
    }

    async findIssue(issueId, options = {}) {
        if (!this.baseUrl || !this.headers) {
            console.error('Jira configuration not set');
            throw new Error('Jira configuration not set. Call setConfig first.');
        }

        try {
            console.log('Finding Jira issue:', issueId);
            const fields = options.fields?.join(',') || 'summary,description,comment';
            const response = await axios.get(
                `${this.baseUrl}/issue/${issueId}?fields=${fields}`,
                {
                    headers: this.headers
                }
            );
            console.log('Successfully retrieved Jira issue:', issueId);
            return response.data;
        } catch (error) {
            console.error('Error finding Jira issue:', error.response?.data || error.message);
            throw error;
        }
    }

    async addComment(issueId, comment) {
        if (!this.baseUrl || !this.headers) {
            console.error('Jira configuration not set');
            throw new Error('Jira configuration not set. Call setConfig first.');
        }

        try {
            console.log('Adding comment to Jira issue:', issueId);
            const response = await axios.post(
                `${this.baseUrl}/issue/${issueId}/comment`,
                {
                    body: {
                        type: "doc",
                        version: 1,
                        content: [
                            {
                                type: "paragraph",
                                content: [
                                    {
                                        type: "text",
                                        text: comment.body
                                    }
                                ]
                            }
                        ]
                    }
                },
                {
                    headers: this.headers
                }
            );
            console.log('Successfully added comment to Jira issue:', issueId);
            return response.data;
        } catch (error) {
            console.error('Error adding Jira comment:', error.response?.data || error.message);
            throw error;
        }
    }
}

class TranscriptProcessor {
    constructor() {
        console.log('Initializing TranscriptProcessor');
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        
        // Initialize Jira client
        this.jira = new JiraClient();

        // Initialize TF-IDF
        this.tfidf = new TfIdf();
    }

    async processTranscript(transcript, meetingId, jiraConfig) {
        console.log('Processing transcript for meeting:', meetingId);
        try {
            // Set Jira configuration
            this.jira.setConfig(jiraConfig);

            // Split transcript into topics using AI
            console.log('Splitting transcript into topics');
            const topics = await this.splitIntoTopics(transcript);
            console.log(`Split transcript into ${topics.length} topics`);
            
            // Process each topic
            for (const topic of topics) {
                console.log('Processing topic:', topic.topic);
                // Identify related Jira ticket
                const jiraTicket = await this.identifyJiraTicket(topic);

                if (!jiraTicket?.key) {
                    console.log('No matching Jira ticket found for topic:', topic.topic);
                    continue;
                }
                
                console.log('Found matching Jira ticket:', jiraTicket.key);
                // Generate summary and one-liner
                const { summary, oneLiner } = await this.generateSummaryAndOneLiner(topic, jiraTicket);
                console.log('Generated summary and one-liner for ticket:', jiraTicket.key);
                
                // Extract resource links from the transcript
                const resourceLinks = this.extractResourceLinks(topic.text);
                console.log(`Extracted ${resourceLinks.length} resource links`);

                // Add the update as a comment to the Jira ticket
                if (summary && oneLiner) {
                    console.log('Adding comment to Jira ticket:', jiraTicket.key);
                    if (resourceLinks.length > 0) {
                        await this.jira.addComment(jiraTicket.key, {
                            body: `Update from meeting discussion:\n\n${oneLiner}\n\nDetails:\n${summary}\n\nResources:\n${resourceLinks.join('\n')}`
                        });
                    } else {
                        await this.jira.addComment(jiraTicket.key, {
                            body: `Update from meeting discussion:\n\n${oneLiner}\n\nDetails:\n${summary}`
                        });
                    }
                }
                
                // Store in database
                console.log('Storing transcript snippet in database');
                await this.storeSnippet({
                    webex_meeting_id: meetingId,
                    jira_ticket_id: jiraTicket.key,
                    original_transcript: topic,
                    summary,
                    one_liner: oneLiner,
                    resource_links: resourceLinks
                });
                console.log('Successfully stored transcript snippet');
            }
            console.log('Finished processing transcript');
        } catch (error) {
            console.error('Error processing transcript:', error);
            throw error;
        }
    }

    async splitIntoTopics(transcript) {
        console.log('Splitting transcript into topics using AI');
        try {
            const response = await this.openai.chat.completions.create({
                model: "gpt-4o-mini",
                response_format: { type: "json_object" },
                messages: [
                    {
                        role: "system",
                        content: `You are a helpful assistant that splits meeting transcripts into distinct topics and analyzes each topic.
                        Follow these rules:
                        1. Identify natural topic boundaries in the conversation
                        2. Each topic should be a complete, coherent segment
                        3. Filter out any topic that is not related to any work context like greetings, goodbyes, small talk, etc.
                        4. For each topic, extract:
                           - 5-7 most important technical terms and concepts as keywords
                           - A brief description of the core topic as mainConcept
                        5. Return a JSON object where each item in the data array has:
                           - "text": the transcript segment
                           - "wordCount": number of words in the segment
                           - "topic": a brief description of what this segment discusses
                           - "keywords": array of 5-7 most important technical terms and concepts
                           - "mainConcept": a brief description of the core topic
                        Example format:
                        {"data": [
                            {
                                "text": "transcript segment 1...",
                                "wordCount": 300,
                                "topic": "Discussion about feature X",
                                "keywords": ["feature", "implementation", "API", "database", "security"],
                                "mainConcept": "Implementation details of the new authentication feature"
                            }
                        ]}
                        Generate a JSON object for the array. Return only the JSON object, nothing else.`
                    },
                    {
                        role: "user",
                        content: `Split this transcript into distinct topics and analyze each topic for key concepts. 
                        Transcript: ${transcript}`
                    }
                ]
            });

            const topics = JSON.parse(response.choices[0].message.content).data;
            console.log(`Successfully split transcript into ${topics.length} topics`);
            
            // Validate the response format
            if (!Array.isArray(topics)) {
                console.error('Invalid response format: expected array');
                throw new Error('Invalid response format: expected array');
            }

            return topics;
        } catch (error) {
            console.error('Error parsing topics:', error);
            // If parsing fails, fall back to treating the entire transcript as one topic
            console.log('Falling back to treating entire transcript as one topic');
            return [{
                text: transcript,
                wordCount: transcript.split(/\s+/).length,
                topic: "Full transcript",
                keywords: [],
                mainConcept: "Complete transcript segment"
            }];
        }
    }

    async identifyJiraTicket(topic) {
        console.log('Identifying Jira ticket for topic:', topic.topic);
        try {
            // Use the pre-extracted keywords and mainConcept from the topic object
            const { keywords, mainConcept } = topic;

            // Search Jira tickets using the extracted keywords
            console.log('Searching Jira tickets with keywords:', keywords);
            const jiraTickets = await this.searchJiraTickets(keywords, mainConcept, topic.text);
            
            if (jiraTickets.length > 0) {
                console.log('Found matching Jira ticket:', jiraTickets[0].key);
                return jiraTickets[0];
            }

            console.log('No matching Jira tickets found');
            return null;
        } catch (error) {
            console.error('Error identifying Jira ticket:', error);
            return null;
        }
    }

    async searchJiraTickets(keywords, mainConcept, topicText) {
        console.log('Searching Jira tickets with keywords:', keywords);
        try {
            // 1. Build JQL query using keywords
            const jqlQuery = `text ~ "${keywords.join('" OR text ~ "')}" ORDER BY updated DESC`;
            console.log('JQL Query:', jqlQuery);
            
            // 2. Search tickets using Jira API with increased maxResults
            const searchResults = await this.jira.searchJira(jqlQuery, {
                maxResults: 50,
                fields: ['summary', 'description', 'comments', 'renderedFields']
            });

            // 3. Process tickets in batches
            const BATCH_SIZE = 10;
            const tickets = searchResults.issues;
            console.log(`Processing ${tickets.length} tickets in batches of ${BATCH_SIZE}`);
            const scoredTickets = [];

            // Process tickets in batches
            for (let i = 0; i < tickets.length; i += BATCH_SIZE) {
                const batch = tickets.slice(i, i + BATCH_SIZE);
                console.log(`Processing batch ${i/BATCH_SIZE + 1} of ${Math.ceil(tickets.length/BATCH_SIZE)}`);
                const batchScores = await this.processTicketBatch(batch, topicText, keywords);
                scoredTickets.push(...batchScores);
            }

            // 4. Sort by relevance and return
            const sortedTickets = scoredTickets.sort((a, b) => b.relevance - a.relevance);
            console.log(`Found ${sortedTickets.length} relevant tickets`);
            return sortedTickets;
        } catch (error) {
            console.error('Error searching Jira tickets:', error);
            return [];
        }
    }

    async processTicketBatch(tickets, topicText, keywords) {
        console.log(`Processing batch of ${tickets.length} tickets`);
        // Prepare all ticket content at once
        const ticketContents = tickets.map(ticket => ({
            key: ticket.key,
            content: `${ticket.fields.summary} ${ticket.fields.description?.content?.map(c => c.content?.map(t => t.text).join(' ')).join(' ') || ''}`.toLowerCase(),
            fields: {
              ...ticket.fields
            }
        }));

        // Calculate TF-IDF for the entire batch at once
        this.tfidf = new TfIdf();
        ticketContents.forEach(ticket => this.tfidf.addDocument(ticket.content));
        this.tfidf.addDocument(topicText.toLowerCase());

        // Calculate scores for all tickets in the batch
        const scoredTickets = ticketContents.map((ticket, index) => {
            const keywordScore = this.calculateKeywordScore(ticket.content, keywords);
            const tfidfScore = this.calculateTfIdfScoreForBatch(index, ticketContents.length);
            const similarityScore = this.calculateTextSimilarity(ticket.content, topicText.toLowerCase());

            const relevanceScore = (keywordScore * 0.4) + (tfidfScore * 0.4) + (similarityScore * 0.2);

            return {
                key: ticket.key,
                relevance: relevanceScore,
                fields: ticket.fields
            };
        });

        console.log(`Processed batch with relevance scores ranging from ${Math.min(...scoredTickets.map(t => t.relevance))} to ${Math.max(...scoredTickets.map(t => t.relevance))}`);
        return scoredTickets;
    }

    async generateSummaryAndOneLiner(topic, jiraTicket) {
        console.log('Generating summary and one-liner for ticket:', jiraTicket.key);
        try {
            // 1. Prepare context with ticket history
            const context = `
                Ticket Summary: ${jiraTicket.fields.summary}
                Original Description: ${jiraTicket.fields.description?.content?.map(c => c.content?.map(t => t.text).join(' ')).join(' ') || ''}
                Previous Updates:
                ${jiraTicket.fields.comment.comments.map(c => c.body.content?.map(p => p.content?.map(t => t.text).join(' ')).join(' ')).join('\n')}
                New Discussion: ${topic.text}
            `;

            // 2. Generate summary and one-liner using the full context
            const response = await this.openai.chat.completions.create({
                model: "gpt-4o-mini",
                response_format: { type: "json_object" },
                messages: [
                    {
                        role: "system",
                        content: `You are a helpful assistant that analyzes changes and updates in project discussions.
                        Given the ticket history and new discussion, generate:
                        1. A detailed summary of what's new or changed
                        2. A concise one-liner update
                        Return as JSON with 'summary' and 'oneLiner' fields.
                        3. If the ticket is not related to the discussion, return null for both summary and oneLiner.
                        4. If there is no new information or there are already comments on the ticket regarding the same discussion, return null for both summary and oneLiner.
                        `
                    },
                    {
                        role: "user",
                        content: `Analyze this context and identify new changes or updates: ${context}`
                    }
                ]
            });
            
            const { summary, oneLiner } = JSON.parse(response.choices[0].message.content);
            console.log('Successfully generated summary and one-liner');
            
            return {
                summary: summary?.trim(),
                oneLiner: oneLiner?.trim()
            };
        } catch (error) {
            console.error('Error generating summary and one-liner:', error);
            return {
                summary: "Error generating summary",
                oneLiner: "Error generating one-liner"
            };
        }
    }

    extractResourceLinks(topic) {
        console.log('Extracting resource links from topic');
        // Extract URLs from the transcript
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const links = topic.match(urlRegex) || [];
        console.log(`Found ${links.length} resource links`);
        return links;
    }

    async storeSnippet(data) {
        console.log('Storing transcript snippet in database');
        try {
            const result = await db.query(
                `INSERT INTO transcript_snippets 
                (webex_meeting_id, jira_ticket_id, original_transcript, summary, one_liner, resource_links)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *`,
                [
                    data.webex_meeting_id,
                    data.jira_ticket_id,
                    JSON.stringify(data.original_transcript),
                    data.summary,
                    data.one_liner,
                    data.resource_links
                ]
            );
            console.log('Successfully stored transcript snippet');
            return result.rows[0];
        } catch (error) {
            console.error('Error storing transcript snippet:', error);
            throw error;
        }
    }

    calculateTfIdfScoreForBatch(ticketIndex, totalTickets) {
        // Get TF-IDF vectors for the ticket and topic
        const ticketVector = this.tfidf.listTerms(ticketIndex).map(item => item.tfidf);
        const topicVector = this.tfidf.listTerms(totalTickets).map(item => item.tfidf);

        return this.cosineSimilarity(ticketVector, topicVector);
    }

    calculateKeywordScore(text, keywords) {
        const textTokens = new Set(tokenizer.tokenize(text));
        const matchedKeywords = keywords.filter(keyword => 
            textTokens.has(keyword.toLowerCase())
        );
        return matchedKeywords.length / keywords.length;
    }

    calculateTfIdfScore(text1, text2) {
        this.tfidf = new TfIdf();
        this.tfidf.addDocument(text1);
        this.tfidf.addDocument(text2);

        const vector1 = this.tfidf.listTerms(0).map(item => item.tfidf);
        const vector2 = this.tfidf.listTerms(1).map(item => item.tfidf);

        return this.cosineSimilarity(vector1, vector2);
    }

    calculateTextSimilarity(text1, text2) {
        // Use Jaro-Winkler similarity for short text comparison
        return natural.JaroWinklerDistance(text1, text2);
    }

    cosineSimilarity(vec1, vec2) {
        const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
        const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
        const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
        return dotProduct / (magnitude1 * magnitude2);
    }
}

module.exports = new TranscriptProcessor(); 