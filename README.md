# 🍿 SnackIt 🍿

**Live Demo:** [**https://snackit.amanlabs.dev/**](https://snackit.amanlabs.dev/).

SnackIt is a full-stack web application that allows users to order their favorite snacks with ease\! 🚀

## ✨ Features

  * **🛍️ Browse & Filter:** Easily browse and filter through a wide variety of delicious snacks.
  * **🛒 Shopping Cart:** Add snacks to your cart and manage your order seamlessly.
  * **🔐 Secure Authentication:** User authentication with both email/password and Google OAuth.
  * **👑 Admin Dashboard:** A dedicated dashboard for admins to manage products, orders, and users.
  * **📱 Responsive Design:** A beautiful and user-friendly interface that works on all devices.

## 🛠️ Tech Stack

  * **💻 Frontend:**
      * [React](https://reactjs.org/)
      * [Vite](https://vitejs.dev/)
      * [TypeScript](https://www.typescriptlang.org/)
      * [Tailwind CSS](https://tailwindcss.com/)
      * [Shadcn/ui](https://ui.shadcn.com/)
  * **⚙️ Backend:**
      * [Node.js](https://nodejs.org/)
      * [Express](https://expressjs.com/)
      * [TypeScript](https://www.typescriptlang.org/)
  * **🗃️ Database:**
      * [PostgreSQL](https://www.postgresql.org/)
      * [Drizzle ORM](https://orm.drizzle.team/)

## 🚀 Getting Started

### Prerequisites

  * Node.js (v18 or higher recommended)
  * npm
  * A PostgreSQL database

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/agarwalaman598/snackit-store.git
    cd snackit-store
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    Create a `.env` file in the root of the project and add the following:

    ```env
    DATABASE_URL="your_postgresql_database_url"
    PORT="3000"
    ```

### Running the application

  * **Development:**

    ```bash
    npm run dev
    ```

  * **Production:**

    ```bash
    npm run build
    npm run start
    ```

## 📜 Scripts

| Script | Description |
| :--- | :--- |
| `npm run dev` | Starts the development server. |
| `npm run build` | Builds the application for production. |
| `npm run start` | Starts the production server. |
| `npm run check` | Type-checks the project. |
| `npm run db:push` | Pushes database schema changes. |
| `npm test:playwright` | Runs Playwright tests. |

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://opensource.org/license/mit) file for details.

## 📧 Support

For any questions or support, please contact [support@snackit.com](mailto:agarwal.aman598@gmail.com).
