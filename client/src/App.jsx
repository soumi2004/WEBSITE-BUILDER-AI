
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthLayout, GuestLayout } from "./pages/Layout";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import BuilderPage from "./pages/BuilderPage";
import PreviewPage from "./pages/PreviewPage";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <>
    <Toaster />
    {/* Routes ar vitor  application ar different URL route define kora hoi */} 
    <Routes>
      <Route element={<GuestLayout />}>
        {/*ai Route ta /login url ta ka handle korbe user jhkon browser a /login page open korbe thkon thkon auth page comoponent render hobe
      ----Render means screen a dakhba
      --------->mode ta holo ki akta props ar maddhoma Authpage bujhba ja login page ar ui dakhta hobe 
      ------>onno route khetre aki rules ee use hobe<------*/}
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
      </Route>

      {/*Protected routes */}
      <Route element={<AuthLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/builder/:id" element={<BuilderPage />} />
        <Route path="/preview/:id" element={<PreviewPage />} />
      </Route>

      { /* Catch-all */ }
     <Route path="*" element={<Navigate to="/" replace/>} />

    </Routes>
    </>
  

    
  );
};

export default App;
