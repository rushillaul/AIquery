# Software Requirements Specification (SRS) - AI-Powered SQL Query Generator

## 1. Introduction
### 1.1 Purpose
The purpose of this document is to define the software requirements for the AI-powered SQL Query Generator. This application allows users to ask questions in plain English, which are then converted into executable SQL queries utilizing an AI model.

### 1.2 Scope
The application will consist of a React-based frontend and an Express-based Node.js backend. 
Key features include:
1. Converting plain Natural Language (English) text into SQL queries.
2. Executing the generated SQL queries against a target database.
3. Returning and displaying the execution results in a tabular format.
4. "Query Explanation Mode": Generating a simplified plain English explanation of what the SQL logic actually does.
5. "Query Safety System": An AI-augmented or rule-based safety mechanism that flags dangerous operations such as `DROP` statements or `DELETE`/`UPDATE` operations missing a `WHERE` clause.

### 1.3 Technology Stack
- **Frontend**: React.js
- **Backend**: Express.js (Node.js)
- **Database**: PostgreSQL / SQLite (for demo purposes)
- **AI Integration**: OpenAI API, Google Gemini API, or Anthropic Claude API (to be selected based on prompt setup).

## 2. Overall Description
### 2.1 Product Perspective
This system is an independent, monolithic client-server web application. The frontend communicates via REST APIs with the Express backend. The Backend communicates directly with an LLM and the relational database.

### 2.2 System Architecture
1. **User Interface (UI)**: Accepts user text queries, displays tables of data, explains the executed query, and displays any critical warnings.
2. **API Layer**: `POST /query` endpoint handled by Express.
3. **AI Service**: Constructs the SQL, explains the query, and parses for safety issues.
4. **Database Engine**: Executes the formulated syntactically-valid SQL string and returns the data records.

## 3. Functional Requirements
### 3.1 NL to SQL Generation
- **Requirement**: The system shall take a user's natural language input and generate a syntactically correct SQL query matching the active database schema.

### 3.2 Execute SQL and Return Results
- **Requirement**: The system shall execute the generated query safely.
- **Requirement**: The system shall return a JSON payload containing the resulting rows.

### 3.3 Query Explanation Mode
- **Requirement**: The system shall generate a simple English explanation of the generated SQL query so non-technical users can verify the logic.

### 3.4 Safety and Danger Flagging
- **Requirement**: The system shall flag and block/warn against destructive commands.
- **Criteria**: At a minimum, it must flag the use of `DROP` and `DELETE`/`UPDATE` without `WHERE` clauses.

## 4. Non-Functional Requirements
### 4.1 Security
- **Data Protection**: The database connection used by the AI execution layer should ideally be a read-only role unless explicit modification requirements are given.
- **Injection Prevention**: Backend must sanitize and handle SQL logic to minimize SQL injection threats.

### 4.2 Usability
- UI shall be simple, offering a chat-like interface or a structured form with a result data table.
