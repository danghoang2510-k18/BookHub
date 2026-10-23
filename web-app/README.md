# BookHub web frontend

This folder contains the React 18 frontend for BookHub. It uses React Router, Material UI, and Axios.

## Run locally

```bash
npm install
npm start
```

The frontend expects the API gateway at `http://localhost:8888/api/v1`, configured in `src/configurations/configuration.js`. Make sure the backend services are running and accessible at that address.

## Main pages

- `/login` — username/password sign-in.
- `/` — authenticated feed, paginated posts, and create-post dialog.
- `/profile` — update profile details and upload a profile image.
- `/chat` — conversations and message view backed by the chat API endpoints.

Google OAuth sign-in and account registration are not implemented by the provided backend/frontend flow. The Google button therefore explains that the provider is not configured rather than pretending to sign in.
