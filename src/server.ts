// Import necessary modules from Node.js using CommonJS syntax
import * as http from 'http';
import { URL } from 'url'; 

// Define what a quote looks like
interface Quote {
    id: number;
    text: string;
    author: string;
    category: string;
}

// Create our quote API class
class SimpleQuoteAPI {
    // Our collection of quotes
    private quotes: Quote[] = [
        {
            id: 1,
            text: "The only way to do great work is to love what you do.",
            author: "Steve Jobs",
            category: "inspiration"
        },
        {
            id: 2,
            text: "Life is what happens when you're busy making other plans.",
            author: "John Lennon",
            category: "life"
        },
        {
            id: 3,
            text: "The future belongs to those who believe in the beauty of their dreams.",
            author: "Eleanor Roosevelt",
            category: "motivation"
        }
    ];

    private server: http.Server;

    constructor() {
        this.server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
            console.log(`Received request: ${req.method} ${req.url}`);
            
            // Allow requests from any website (CORS)
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Content-Type', 'application/json');
            
            // Handle different types of requests
            if (req.method === 'GET') {
                this.handleGetRequest(req, res);
            } else if (req.method === 'OPTIONS') {
                // Handle preflight requests
                res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
                res.writeHead(200);
                res.end();
            } else {
                // If it's not a GET request, send an error
                res.writeHead(405); // Method Not Allowed
                res.end(JSON.stringify({ error: 'Only GET requests are allowed' }));
            }
        });
    }

    // Handle GET requests
    private handleGetRequest(req: http.IncomingMessage, res: http.ServerResponse) {
        try {
            // Parse the URL to understand what the user wants
            const url = new URL(req.url || '', `http://${req.headers.host}`);
            const path = url.pathname;
            const params = url.searchParams;

            // Route to the appropriate handler based on the path
            if (path === '/api/quote') {
                this.handleQuoteRequest(res, params);
            } else if (path === '/api/quotes') {
                this.handleQuotesRequest(res, params);
            } else {
                // If the path is not recognized
                res.writeHead(404);
                res.end(JSON.stringify({ error: 'Endpoint not found. Try /api/quote or /api/quotes' }));
            }
        } catch (error) {
            console.error('Error handling request:', error);
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    }

    // Handle request for a single quote
    private handleQuoteRequest(res: http.ServerResponse, params: URLSearchParams) {
        const id = params.get('id');
        const category = params.get('category');
        
        let quote: Quote | undefined;
        
        // If user asked for a specific quote by ID
        if (id) {
            quote = this.quotes.find(q => q.id === parseInt(id));
        } 
        // If user asked for a random quote from a category
        else if (category) {
            const categoryQuotes = this.quotes.filter(q => q.category === category);
            if (categoryQuotes.length > 0) {
                quote = categoryQuotes[Math.floor(Math.random() * categoryQuotes.length)];
            }
        } 
        // If user asked for any random quote
        else {
            quote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
        }
        
        // Send the response
        if (quote) {
            res.writeHead(200);
            res.end(JSON.stringify(quote));
        } else {
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Quote not found' }));
        }
    }

    // Handle request for all quotes
    private handleQuotesRequest(res: http.ServerResponse, params: URLSearchParams) {
        const category = params.get('category');
        
        let quotes = this.quotes;
        
        // Filter by category if requested
        if (category) {
            quotes = quotes.filter(q => q.category === category);
        }
        
        // Send the response
        res.writeHead(200);
        res.end(JSON.stringify(quotes));
    }

    // Start the server
    public start(port: number) {
        this.server.listen(port, () => {
            console.log(`✨ Quote server is running on http://localhost:${port}`);
            console.log('Try these URLs in your browser:');
            console.log(`  http://localhost:${port}/api/quote`);
            console.log(`  http://localhost:${port}/api/quotes`);
            console.log(`  http://localhost:${port}/api/quote?category=inspiration`);
        });
        
        // Handle server errors
        this.server.on('error', (error: Error) => {
            console.error('Server error:', error);
        });
    }
}

// Create and start our server
const quoteAPI = new SimpleQuoteAPI();
quoteAPI.start(3000);