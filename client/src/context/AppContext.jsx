
import { createContext, useState, useContext, useEffect, useCallback } from "react";
import api from "../api/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AppContext = createContext(undefined);//context ar kaj holo ki application ar ak jaigai data rakha onek component ar moddha share kora

export function AppContextProvider({ children }) {

          const navigate = useNavigate()

  const [user, setUser] = useState(null);//akhna user ar data rkha hoi
  const [loadingUser, setLoadingUser] = useState(true);//ata website a user login acha ki na seta bujhai ar ki vava sei login obostha ta china rakha 

  // states
  const [projects, setProjects] = useState([]);
  const[loadingProjects, setLoadingProjects] = useState(true);
    const[activeProject, setActiveProject] = useState(null);
      const[loadingActiveProject, setLoadingActiveProject] = useState(true);
        const[chatLoading, setChatLoading] = useState(false);
          const[genaratingProject, setGenaratingProject] = useState(false);
            const[activeFile, setActiveFile] = useState("/App.js");
              const[showCode, setShowCode] = useState(false);

  // Auth Actions----------------->akhna authentication somporkito function gulo rakha hobe 
  const checkSession = async ()=>{ //------>ai check session ar kaj hobe user login  acha ki nei seta janar 
    try{
         const { data } = await api.get("/api/auth/me")
         setUser(data.user)
    } catch (error) {
        setUser(null)
    } finally{
      setLoadingUser(false);
    }
  }

  useEffect(()=>{
    checkSession()
  },[])

  const login = async(email, password) => {
          try{
            const{ data } =await api.post("/api/auth/login",
              {email, password});
              setUser(data.user)
              toast.success("Welcome Back! ")
              navigate("/")
          } catch (err){
            console.error("Login failed:",err);
            const errMsg = err?.response?.data?.error || "Invalid email or password";
            toast.error(errMsg);
            throw new Error(errMsg);
          }
  }

  const register = async(name, email, password) => {
          try{
            const{ data } =await api.post("/api/auth/register",
              {name, email, password});
              setUser(data.user)
              toast.success("Account created successfully!")
              navigate("/")
          } catch (err){
            console.error("Registration failed:",err);
            const errMsg = err?.response?.data?.error || "Registration failed";
            toast.error(errMsg);
            throw new Error(errMsg);
          }
  }

     const logout = async ()=>{
      try{
          await api.post("/api/auth/logout")
          setUser(null)
          setProjects([])
          setActiveProject(null)
          toast.success("Logged out successfully")
          navigate("/login")
      } catch (err){
            console.error("Logout failed:", err);
            toast.error("Logout failed");
      }
     }


     // project action
     const loadProjects = async () => {
      if(!user) return;
      try{
          const {data} = await api.get("/api/projects")
          setProjects(data)
      } catch(error){
            console.error("Failed to list projects:", error);
            toast.error("Failed to load projects list");
      } finally{
        setLoadingProjects(false);
      }
     }

     const loadProject = async (id, silent = false) => {
       if(!user) return;
       if(!silent) setLoadingActiveProject(true)
        try{
      const{data} = await api.get(`/api/projects/${id}`)

      //Default file selection
      const files = Object.keys(data.files);
      if(files.length > 0){
        setActiveFile((prev) =>{
                 if(files.includes(prev)) return prev;
                 if(files.includes("/App.js")) return "/App.js";
                 return files[0];
        })
      }
      } catch(err){
         console.error("Failed to load project:", err);
         if(!silent){
          toast.error("Failed to load project details");
          navigate("/");
         } 
      } finally{
        if(!silent) setLoadingActiveProject(false)
      }
     }

     //Automatically poll active project status if generating or pending
     useEffect(() =>{
      if(!activeProject?._id || !user) return;

      const isOngoing = activeProject.status === "generating" || activeProject.status === "pending" || activeProject.status === "revising";

      if(isOngoing){
        setChatLoading(true);
        const interval = setInterval(() =>{
          loadProject(activeProject._id,true)
        }, 2000);
        return ()=> clearInterval(interval)
      } else {
            setChatLoading(false);
      } 

     }, [activeProject?._id, activeProject?.status, loadProject, user])

     const handleGenerate = useCallback(
      async(prompt) => {
        if(!user) return;

        setGenaratingProject(true);
        try{
          const{ data } = await api.post("/api/projects", {prompt});
          toast.success("AI Agent is planning structure...")
          navigate(`/builder/${data._id}`);
        } catch(err) {
          console.error("Failed to generate project:", err);
          toast.error(err?.response?.data?.error || "Failed to generate project");
        } finally{
          setGenaratingProject(false);
        }
      }, [navigate,user]
     )

      const handleDelete = useCallback(
      async(id) => {
        if(!user) return;

        try{
          await api.delete(`/api/projects/${id}`);
          setProjects((prev) => prev.filter((p)=>p._id !== id))
          toast.success("Project deleted successfully")
        } catch(err) {
          console.error("Failed to delete project:", err);
          toast.error("Failed to delete project");
        }
      }, [user]
     )

  return (
    //provider kaj holo ki tar vitora thaka pottak child component ke context ar data provide kora
    //------------------>amar akhna context ar maddhoma data provide korechi, amra akhna duto value provide korechi ja gulo provider vitora thka compent gulo access korte parba
    <AppContext.Provider value={{ user, 
    loadingUser, 
    login, 
    register, 
    projects,
    loadingProjects,
    activeProject,
    loadingActiveProject,
    chatLoading,
    genaratingProject,
    activeFile,
    showCode,
    setActiveFile,
    setShowCode,
    loadProjects,
    loadProject,
    handleGenerate,
    handleDelete,
    logout
    }}>  
       {/*children mna holo provider ar vitora jasob component rakha hobe */}
      {children}
    </AppContext.Provider>
  );
}


// ata akta custom hook ar kaj holo context ar data sohoja paour akta reuseable function ata lekhar karon onno component bar bar useContext(AppContext)  ata likhta hobe na const { user, loadingUser } = useAppContext();  ata likhlei hobe
export function useAppContext() {
  const context = useContext(AppContext);//akhna appcontext thk data naoua hochha jata amra diyachi user,loadinguser

  if (context === undefined) {//ata error check kora hoccha ja useAppcontext ki provider vitra babhar kora hoyacha ki na
    throw new Error("useAppContext must be used within an AppContextProvider");
  }

  return context;
}