# Referral Marketing Platform

This project is a full-stack referral marketing platform built using the MERN stack.
It was developed to simulate how a real-world system handles referrals, meetings, and role-based access in a structured way.

The goal was not just to build features, but to make it behave like an actual product.

---

## What this project does

XOON allows users to join a chapter, create referrals, attend meetings, and track the progress of deals.

There are different roles in the system:

* **Member** – can create referrals and attend meetings
* **Chapter Lead** – manages chapter-level activities
* **Admin** – controls users and approvals

The platform handles onboarding, approvals, and redirects users based on their role.

---

## Key features

* User authentication and onboarding flow
* Role-based dashboards (Member / Chapter Lead / Admin)
* Referral creation with basic validation (including email)
* Referral lifecycle tracking (Given → Accepted → Converted)
* Meeting management with attendance tracking
* Clean UI with mobile responsiveness
* Approval system (users get limited access until approved)

---

## Tech stack

Frontend:

* React (Vite)
* Tailwind CSS

Backend:

* Node.js
* Express.js
* MongoDB (Mongoose)

Other:

* JWT authentication
* REST API architecture

---

## How to run locally

Clone the project:

```bash
git clone https://github.com/your-username/xoon-platform.git
cd xoon-platform
```

Install dependencies:

Backend:

```bash
cd server
npm install
```

Frontend:

```bash
cd client
npm install
```

---

Create a `.env` file inside the server folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

---

Run the project:

Backend:

```bash
npm run dev
```

Frontend:

```bash
npm run dev
```

---

## Deployment

You can deploy this project easily:

* Backend → Render / Railway
* Frontend → Vercel / Netlify

Just make sure your API URL is updated in the frontend.

---

## Notes

* Admin approval is required for full access
* Some features are restricted until approval
* The system is designed to be scalable and structured

---

## What I focused on

While building this, the main focus was:

* Keeping role, approval, and data flow separate
* Avoiding broken or inconsistent states
* Making the UI simple but usable
* Writing logic that can scale beyond a demo

---

## Future improvements

* Email verification system
* Payment integration
* Better analytics

---

## Final thought

This project is not just a UI demo — it’s built to behave like a real system with proper flow and logic.

There are still improvements to be made, but the core structure is solid and ready to scale.

---

Feel free to explore or improve it further.
