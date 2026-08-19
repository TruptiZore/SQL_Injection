# Demonstration of SQL Injection and Prevention Techniques

This project is a simple, educational web application built with **Node.js, Express, and MySQL** to demonstrate how SQL Injection works and how it can be prevented using Secure Coding Practices (Prepared Statements).

## 🛠️ Technology Stack
- **Frontend:** HTML, CSS, JavaScript (Vanilla)
- **Backend:** Node.js, Express.js
- **Database:** MySQL

## 📁 Project Structure
- `server.js`: The Express server containing both vulnerable and secure login routes.
- `setup.sql`: SQL commands to initialize the database and tables.
- `public/index.html`: The user interface with two login forms.
- `public/style.css`: The styling for the project.
- `package.json`: Project dependencies.

---

## 🚀 How to Run the Project

### Step 1: Database Setup
1. Make sure you have **MySQL** installed and running (e.g., using XAMPP, WAMP, or standalone MySQL).
2. Open your MySQL command-line client or a GUI tool like phpMyAdmin.
3. If using the command line, run the following command to execute the `setup.sql` script:
   ```bash
   mysql -u root -p  
   ```
   *(Leave the password blank if you haven't set one, which is default for XAMPP).*

### Step 2: Configure Database Connection
If your MySQL username is NOT `root` or you have a password, you need to update the connection details in `server.js`:
```javascript
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      // <-- Change this if needed
    password: '',      // <-- Add your password here
    database: 'security_demo'
});
```

### Step 3: Install Dependencies
Open your terminal in the project folder and run:
```bash
npm install
```

### Step 4: Start the Server
Run the following command to start the Node.js server:
```bash
npm start
```
Alternatively:
```bash
node server.js
```

### Step 5: Open the Application
Open your web browser and go to:
**http://localhost:3000**

---

## 🧪 How to Test the Vulnerability

### 1. The Vulnerable Login
The vulnerable login route (`/login`) directly inserts user input into the SQL query without validation:
```javascript
const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
```

**The Attack:**
1. In the **Vulnerable Login** form, enter the following as the username:
   `admin' --`
2. Enter anything as the password (e.g., `123`).
3. Click Login.

**Result:** You will successfully log in, bypassing the password check! 

**Why it works:**
The SQL query becomes:
```sql
SELECT * FROM users WHERE username = 'admin' --' AND password = '123'
```
The `--` sequence comments out the rest of the query in MySQL, so the password check is completely ignored by the database.

### 2. The Secure Login
The secure login route (`/secure-login`) uses **Prepared Statements** (Parameterized Queries) to prevent injection:
```javascript
const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
db.query(query, [username, password], ...);
```

**The Prevention:**
1. In the **Secure Login** form, enter the exact same attack string: `admin' --`.
2. Enter anything for the password.
3. Click Login.

**Result:** The login will **FAIL**.

**Why it works:**
With prepared statements, the database treats the input strictly as data (a literal string), not as executable SQL code. It looks for a user whose literal username is exactly `"admin' --"`, which doesn't exist.

---

## 🖥️ Console Output
While testing, check the terminal where your Node server is running. You will see the exact SQL queries being executed for both the vulnerable and secure routes. This is a great way to understand the difference under the hood!
