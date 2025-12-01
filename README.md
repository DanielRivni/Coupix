Coupix
======

Coupix is a modern web application designed to help users store and manage coupons and vouchers efficiently. The app provides a seamless and user-friendly experience with a clean UI and smooth interactions.

Official Website
-------------------

[https://coupix.lovable.app](https://coupix.lovable.app/)

Tech Stack
--------------

Coupix is built using the latest web technologies:

*   **Vite** - Fast development and optimized build tool.
    
*   **TypeScript** - Ensuring type safety and robust code.
    
*   **React** - A modern UI framework for building dynamic user interfaces.
    
*   **shadcn-ui** - A collection of accessible and customizable UI components.
    
*   **Tailwind CSS** - A utility-first CSS framework for efficient styling.
    

Features
----------

*   Secure storage and management of coupons and vouchers.
    
*   Responsive and intuitive user interface.
    
*   Fast and optimized performance.
    
*   Accessible on both mobile and desktop devices.
    

CI/CD Pipeline
----------

To streamline the development and deployment process, Coupix utilizes a **CI/CD pipeline** powered by **Jenkins, Docker, and Kubernetes**.

### **Jenkins Configuration**

The pipeline is managed through a Jenkinsfile that automates the following stages:

1.  **Checkout Code** - Fetches the latest version from the GitHub repository.
    
2.  **Determine Version** - Generates an image tag based on Git branches and commits.
    
3.  **Build Docker Image** - Creates a containerized application using the Dockerfile.
    
4.  **Push to Docker Hub** - Uploads the built image to Docker Hub.
    
5.  **Render Kubernetes Deployment** - Uses Jinja2 templates to create deployment files.
    
6.  **Deploy to Kubernetes** - Applies the configuration to the Kubernetes cluster.
    

### **Docker Integration**

The application is containerized with Docker, allowing consistent behavior across environments. The Dockerfile includes:

*   **Base Image** - node:18-alpine for a lightweight runtime.
    
*   **Working Directory** - The app is housed in /app.
    
*   **Dependency Installation** - Uses bun install for package management.
    
*   **Build Process** - Compiles the application using bun run build.
    
*   **Port Exposure** - Exposes port 5000 for external access.
    
*   **Start Command** - Runs the app using bun run start.
    

### **Kubernetes Deployment**

The deployment is managed with Kubernetes, using the following configurations:

*   **Deployment YAML** - Defines pod configurations, replicas, and container settings.
    
*   **Service YAML** - Configures networking to expose the application to the web.
    

These configurations ensure high availability, scalability, and efficient management of the application in a production environment.

----------
By integrating these DevOps practices, Coupix ensures a seamless and automated deployment process, reducing manual effort and increasing reliability.
