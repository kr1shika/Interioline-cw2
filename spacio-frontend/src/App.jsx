// src/App.jsx
import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import './App.css';

const LandingPage = lazy(() => import("./core/public/landing"));
const ChatRoom = lazy(() => import("./core/private/chat"));
const SearchDesignersPage = lazy(() => import("./core/public/searchPage"));
const ProfilePage = lazy(() => import("./core/private/designer/profilePage-designer"));
const StyleMatchQuiz = lazy(() => import("./core/public/styleQuiz"));
const MatchResultPage = lazy(() => import("./core/public/MatchResultPage"));
const InitialProjectPage = lazy(() => import("./core/public/InitialProjectPage"));
const MyProjectsPage = lazy(() => import("./core/public/my-projects"));
const PublicProfilePage = lazy(() => import("./core/public/PublicProfilePage"));
const HelpCenter = lazy(() => import("./core/public/helpCenter"));
const CustomRoomDesigner = lazy(() => import("./core/public/editingRoom/components/room-designer/CustomRoomDesigner"));
const ViewOnlyRoomDesigner = lazy(() => import("./core/public/editingRoom/components/room-designer/ViewOnlyRoomDesigner"));
function App() {

  const publicRoutes = [

    {
      path: "/room-view",
      element: (
        <Suspense fallback={<div>Loading...</div>}>
          <ViewOnlyRoomDesigner />
        </Suspense>
      ),
    },
    {
      path: "/room-edit",
      element: (
        <Suspense fallback={<div>Loading...</div>}>
          <CustomRoomDesigner />
        </Suspense>
      ),
    },
    {
      path: "/help-center",
      element: (
        <Suspense fallback={<div>Loading...</div>}>
          <HelpCenter />
        </Suspense>
      ),
    },
    {
      path: "/designer",
      element: (
        <Suspense fallback={<div>Loading...</div>}>
          <PublicProfilePage />
        </Suspense>
      ),
    },
    {
      path: "/my-projects",
      element: (
        <Suspense fallback={<div>Loading...</div>}>
          <MyProjectsPage />
        </Suspense>
      ),
    },

    {
      path: "/initial-project",
      element: (
        <Suspense fallback={<div>Loading...</div>}>
          <InitialProjectPage />
        </Suspense>
      ),
    },
    {
      path: "/chat",
      element: (
        <Suspense fallback={<div>Loading...</div>}>
          <ChatRoom />
        </Suspense>
      ),
    },
    {
      path: "/results",
      element: (
        <Suspense fallback={<div>Loading...</div>}>
          <MatchResultPage />
        </Suspense>
      ),
    },
    {
      path: "/quiz",
      element: (
        <Suspense fallback={<div>Loading...</div>}>
          <StyleMatchQuiz />
        </Suspense>
      ),
    },
    {
      path: "/",
      element: (
        <Suspense fallback={<div>Loading...</div>}>
          <LandingPage />
        </Suspense>
      ),
    },
    {
      path: "/Home",
      element: (
        <Suspense fallback={<div>Loading...</div>}>
          <LandingPage />
        </Suspense>
      ),
    },
    {
      path: "/search",
      element: (
        <Suspense fallback={<div>Loading...</div>}>
          <SearchDesignersPage />
        </Suspense>
      ),
    },
    {
      path: "/designer-profile",
      element: (
        <Suspense fallback={<div>Loading...</div>}>
          <ProfilePage />
        </Suspense>
      ),
    }

  ];

  const routes = createBrowserRouter([...publicRoutes]);
  return (
    <>
      <RouterProvider router={routes} />
    </>
  );
}

export default App;
