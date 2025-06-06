🍎🍌🍇🥦 Fruits & Vegetables Inventory Management App 🥕🍊🍉🌽
A full-stack MERN application to manage warehouse inventory for fruits and vegetables. It allows users to add, edit, delete, filter, and sort inventory items. The API connects to a persistent MongoDB database and is completely stateless — restarting the server does not affect existing data.

---

## 🌟 Features

- Add, edit, delete fruits and vegetables with price and quantity
- Search and filter by category
- Sort items by name, price, quantity, or expiry date
- Audit logs and tracking for user actions
- Lazy loading for performance optimization
- Accessibility and SEO-friendly design
- ---

## 🧱 Tech Stack

| Layer       | Technologies                |
|-------------|-----------------------------|
| Frontend    | React, Tailwind CSS, React Router |
| Backend     | Node.js, Express.js         |
| Database    | MongoDB                     |
| Others      | Axios, Git, Lighthouse      |

---

## 🚀 How to Run Locally

### 📦 Backend
1. Navigate to `backend/` and run:
   ```bash
   npm install
   npm run dev
 2.  Add a .env file:
    PORT=5000
MONGO_URI=your_mongodb_connection_string( i will provide the credentials seprately)

### 💻 Frontend
1. Navigate to frontend/ and run:
    ```bash
   npm install
    npm run dev

♿ Accessibility & SEO Focus

Accessibility was a key priority. Semantic HTML tags (<header>, <main>, <section>) and ARIA attributes enhance screen reader compatibility. Keyboard navigation is fully supported, and all form controls are labeled. Color contrast meets WCAG 2.1 standards for readability. SEO is strengthened using descriptive page titles, meta descriptions, and structured headings. Lighthouse and manual testing were used to ensure compliance.

🔒 Privacy and Tracking

The system implements basic tracking by logging user actions such as item additions and deletions in an audit log. This tracking helps with accountability without collecting any personal or sensitive user data. No cookies or third-party trackers are used. This approach respects user privacy while ensuring that important actions can be monitored securely.

🛡️ Security Considerations

This app may face threats like:

🧨 NoSQL Injection( have not implemented in the project)

💉 Cross-Site Scripting (XSS) ( have implemented in the project)

1. To protect against NoSQL injection, all API input is validated and sanitized using express-validator and Mongoose schema enforcement. For example, fields are type-checked and unknown keys are ignored. This prevents malformed queries from reaching the database. ( Not Mitigated )
2. To protect against Cross-Site Scripting (XSS), the app uses the helmet middleware with a custom Content Security Policy (CSP). This restricts script, style, and image sources to trusted domains only, reducing the risk of malicious code execution. For example, scriptSrc is limited to 'self' and a trusted CDN, while inline styles are controlled. This ensures that injected scripts from untrusted sources won’t run in the browser. Additionally, JSON inputs are parsed strictly, and CORS settings are locked to known frontend origins, further reducing surface area for attack. ( Mitigated )

📄 License
MIT License

👩‍💻 Made with 💚 by Swarna
