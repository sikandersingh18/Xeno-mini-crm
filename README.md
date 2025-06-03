# Mini-CRM Platform
Welcome to the Mini CRM Platform — a customer segmentation, personalized campaign delivery, and intelligent insights tool built as part of the Xeno SDE Internship assignment.
🚀 Project Overview
This platform enables users to:

Ingest customer and order data via secure REST APIs

Define flexible audience segments with dynamic rule logic

Create and deliver personalized campaigns with delivery logging

Authenticate users via Google OAuth 2.0

Integrate AI-powered features for smarter segmentation and campaign messaging



🛠️ Tech Stack
Frontend: React.js

Backend: Node.js (Express)

Database: MongoDB

Message Broker: Kafka (for async ingestion & campaign delivery)

Authentication: Google OAuth 2.0

AI Integration: OpenAI API (GPT-4) for:

Natural language to segment rules

AI-driven message suggestions

Campaign performance summarization

⚙️ Local Setup Instructions
Clone the repo

bash
Copy
Edit
git clone https://github.com/your-username/mini-crm.git
cd mini-crm
Backend Setup

Navigate to backend folder:

bash
Copy
Edit
cd backend
Install dependencies:

bash
Copy
Edit
npm install
Create a .env file based on .env.example and add:

ini
Copy
Edit
MONGO_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
OPENAI_API_KEY=your_openai_api_key
KAFKA_BROKER=your_kafka_broker_address
Start backend server:

bash
Copy
Edit
npm start
Frontend Setup

Navigate to frontend folder:

bash
Copy
Edit
cd ../frontend
Install dependencies:

bash
Copy
Edit
npm install
Start React app:

bash
Copy
Edit
npm start
Kafka Broker

Ensure Kafka is running locally or accessible remotely as per .env.

📈 Architecture Overview
pgsql
Copy
Edit
+------------------+       +-------------------+       +--------------------+
|  Frontend (React)| <---> | Backend (Node.js) | <---> | MongoDB Database    |
+------------------+       +-------------------+       +--------------------+
                                |
                                v
                        +------------------+
                        | Kafka Message    |
                        | Broker (Pub/Sub) |
                        +------------------+
                                |
                                v
                       +--------------------+
                       | Consumer Services   |
                       | (Async Persistence &|
                       | Campaign Delivery)  |
                       +--------------------+

Authentication via Google OAuth 2.0 secures API endpoints and UI access.

AI integration uses OpenAI APIs to enhance user experience with natural language processing and message generation.
🤖 AI Tools & Features
OpenAI GPT-4 API for:

Translating natural language queries into segment rule logic

Generating personalized message variants for campaigns

Summarizing campaign performance with insightful text

AI used to improve UX and add intelligent automation to campaign management.

⚠️ Known Limitations & Assumptions
Vendor API simulates message delivery with a fixed success/failure ratio (~90% success).

Kafka broker setup assumes availability of a Kafka cluster (local or cloud).

AI features depend on OpenAI API availability and may incur costs.

Campaign delivery logs update asynchronously, which may introduce slight delays in status updates.

Rule builder UI supports basic AND/OR combinations, more complex nested logic may require enhancements.

Authentication scope limited to Google OAuth 2.0 only.

🎥 Demo Video
Watch the demo video here: [YouTube/Drive Link] (replace with your actual link)

📬 Contact
For any questions, reach out at: sikandersingh1823@gmail.com
