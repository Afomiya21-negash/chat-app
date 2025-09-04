Project: Chat App
### 👥 Developers

* **Samuel Girma** - Backend Developer
* **Afomiya Mesfin** - Frontend Developer
* **Danayt Esayas** - Frontend Developer
* **Kenean Biru** - Frontend Developer

  # Buuna T'et'u Chat Application ☕💬

Buuna T'et'u is a modern, real-time chat application built for seamless communication. This README provides an overview of the frontend component `ChatPage.tsx`, its features, and the underlying technologies.
## ✨ Features
  * **Real-Time Chat:** Polls for new messages every 3 seconds to ensure conversations are up-to-date.
  * **User Authentication:** Secure login system using JSON Web Tokens (JWT) for authentication and a middleware to protect API routes.
  * **Private & Group Chats:** Users can engage in one-on-one chats or create and manage groups.
  * **File & Media Sharing:** Supports sending various file types, including images and PDFs, with a built-in download function.
  * **User & Group Management:**
      * **Search Functionality:** Find and start new private chats with other users.
      * **Group Creation:** Easily create new groups.
      * **Group Actions:** Group creators can delete the group or remove members. Users can also leave groups.
  * **User Profile:**
      * View and edit your username and email.
      * Option to permanently delete your account.
  * **Responsive Interface:** A clean, responsive design that adapts to different screen sizes.
    
## 🛠️ Technology Stack

This project leverages a robust set of technologies for a fast and scalable chat experience.
  * **Frontend:**
      * **React (via Next.js):** A powerful framework for building the user interface.
      * **TypeScript:** Ensures code quality and maintainability with static type checking.
      * **Axios:** A promise-based HTTP client used for making API requests.
      * **Lucide React:** A library for beautiful and consistent icons.
      * **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
  * **Backend & Database:**
      * **Prisma ORM:** A next-generation ORM for Node.js and TypeScript, used to interact with the database.
      * **Supabase:** The project's database solution, providing a scalable and easy-to-use backend.
      * **JWT (JSON Web Tokens):** Used for secure user authentication.

## 🚀 Getting Started

### Prerequisites

  * Node.js (LTS version)
  * npm or yarn
  * A Supabase project configured with the appropriate database schema.

### Installation

1.  Clone the repository:

    ```bash
    git clone [repository-url]
    cd [project-folder]
    ```

2.  Install dependencies:

    ```bash
    npm install
    # or
    yarn install
    ```

### Configuration

Create a `.env.local` file in the root directory and add your environment variables, including your Supabase connection string and JWT secret.

```env
DATABASE_URL="[Your-Supabase-Database-URL]"
JWT_SECRET="[Your-JWT-Secret]"
```

### Running the App

1.  Run database migrations (if any):

    ```bash
    npx prisma migrate dev
    ```

2.  Start the development server:

    ```bash
    npm run dev
    # or
    yarn dev
    ```

    The application will be accessible at `http://localhost:3000`.


## 📝 Usage

  * **Login:** Navigate to the `/login` route to authenticate. A successful login stores the JWT token and user details in `localStorage`.
  * **Chat View:** Once logged in, the application will redirect you to the main chat page (`/chat`). The left sidebar displays a list of your private and group chats. Use the search bar to find new users to chat with.
  * **Messaging:** Select a chat from the sidebar to view messages. Use the input field at the bottom to send a message. You can also click the paperclip icon to attach and send files.
  * **Group Actions:** For group chats, click the three vertical dots (`...`) to access a menu with options to add or remove members, or delete the group entirely if you are the creator. Non-creators will see an option to leave the group.
  * **Profile:** Click the hamburger menu in the top-left to access your profile settings. Here you can edit your username and email or delete your account.
