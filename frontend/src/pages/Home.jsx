import React, { useContext, useEffect, useRef, useState } from 'react'
import { userDataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import aiImg from "../assets/ai.gif"
import userImg from "../assets/user.gif"
import { CgMenuRight } from "react-icons/cg";
import { RxCross1 } from "react-icons/rx";



function Home() {
  const { userData, serverUrl, setUserData, getGeminiResponse } = useContext(userDataContext)
  const navigate = useNavigate()

  const [listening,setListening] = useState(false)
  const [userText,setUserText] = useState("")
  const [aiText,setAiText] = useState("")
  const [ham,setHam] = useState(false)
  const isSpeakingRef = useRef(false)
  const recognitionRef = useRef(null)
  const isRecognizingRef = useRef(false)
  const synth = window.speechSynthesis

  const handleLogOut = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/auth/logout`,
        { withCredentials: true }
      )
      setUserData(null)
      navigate("/signin")
    }
    catch (error) {
      setUserData(null)
      console.log(error)
    }
  }

  const startRecognition = ()=>{
    if(!isRecognizingRef.current && !isSpeakingRef.current){
    try{
      recognitionRef.current?.start();
      console.log("Recognition requested to start")
    }
    catch(error){
      if(!error.name !== "InvaliStateError"){
        console.error("start error:",error);
      }
    }
  }
}

  const speak = (text) => {

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "hi-IN"; // Telugu
    const voices = window.speechSynthesis.getVoices();
     const hindiVoice = voices.find((v) => v.lang.toLowerCase() === "hi-IN");
     if (hindiVoice) {
       utterance.voice = hindiVoice;
     }
    isSpeakingRef.current = true;
    utterance.onend = () => {
      setAiText("")
      isSpeakingRef.current = false;
      setTimeout(()=>{
        startRecognition();
      },800)
    };
    synth.cancel()
    synth.speak(utterance);
};

  const handleLocalCommands = (transcript) => {
  const lower = transcript.toLowerCase()

  if (lower.includes("open youtube") && lower.includes("search")) {
    const query = lower.split("search")[1]?.trim()
    if (query) {
      speak(`Opening YouTube and searching ${query}`)
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, "_blank")
    } else {
      speak("Opening YouTube")
      window.open("https://www.youtube.com", "_blank")
    }
    return true
  }

  if (lower.includes("open google") && lower.includes("search")) {
    const query = lower.split("search")[1]?.trim()
    if (query) {
      speak(`Opening Google and searching ${query}`)
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank")
    } else {
      speak("Opening Google")
      window.open("https://www.google.com", "_blank")
    }
    return true
  }

  if (lower.includes("open youtube")) {
    speak("Opening YouTube")
    window.open("https://www.youtube.com", "_blank")
    return true
  }
  if (lower.includes("open google")) {
    speak("Opening Google")
    window.open("https://www.google.com", "_blank")
    return true
  }
  if (lower.includes("open instagram")) {
    speak("Opening Instagram")
    window.open("https://www.instagram.com", "_blank")
    return true
  }
  if (lower.includes("open facebook")) {
    speak("Opening Facebook")
    window.open("https://www.facebook.com", "_blank")
    return true
  }

  if (lower.startsWith("search youtube")) {
    const query = lower.replace("search youtube", "").trim()
    if (query) {
      speak(`Searching YouTube for ${query}`)
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, "_blank")
    }
    return true
  }

  if (lower.startsWith("google search")) {
    const query = lower.replace("google search", "").trim()
    if (query) {
      speak(`Searching Google for ${query}`)
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank")
    }
    return true
  }

  return false
}

  function handleCommand(data) {
    const { type, userInput, response } = data;
    speak(response);

    if (type === 'google_search') {
      const query = encodeURIComponent(userInput);
      window.open(`https://www.google.com/search?q=${query}`, '_blank');
    }

    if (type === 'calculator_open') {
      window.open('https://www.google.com/search?q=calculator', '_blank');
    }

    if (type === 'instagram_open') {
      window.open('https://www.instagram.com/', '_blank');
    }

    if (type === 'facebook_open') {
      window.open('https://www.facebook.com/', '_blank');
    }

    if (type === 'weather-show') {
      window.open('https://www.google.com/search?q=weather', '_blank');
    }

    if (type === 'youtube_search' || type === 'youtube_play') {
      const query = encodeURIComponent(userInput);
      window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
    }
  }

  useEffect(() => {
    // const unlockSpeech = () => {
    //   const utterance = new SpeechSynthesisUtterance(""); // silent unlock
    //   window.speechSynthesis.speak(utterance);
    //   document.removeEventListener("click", unlockSpeech);
    //   console.log("✅ Speech unlocked by first user click.");
    // };
    // document.addEventListener("click", unlockSpeech);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.lang = 'en-US'
    recognition.interimResults = false;

    recognitionRef.current = recognition

    let isMounted = true;


    const startTimeout = setTimeout(()=>{
      if(isMounted && !isSpeakingRef.current && !isRecognizingRef.current){
        try{
          recognition.start()
          console.log("Recognition requested to start");
        }
        catch(error){
          if(error.name !== "InvalidStateError"){
            console.error("Start error:",error)
          }
        }
      }
    },1000)

    recognition.onstart = ()=>{
      isRecognizingRef.current = true;
      setListening(true)
    };

    recognition.onend = ()=>{
      isRecognizingRef.current = false
      setListening(false);

      if(isMounted && !isSpeakingRef.current){
        setTimeout(()=>{
          if(isMounted){
            try{
              recognition.start()
              console.log("Recognition started");
            }
            catch(e){
              if(e.name != "InvalidStartError"){
                console.log(e)
              }
            }
          }
        },1000);
      }
    };

    recognition.onerror = (event)=>{
      console.warn("Recognition error: ",event.error);
      isRecognizingRef.current = false;
      setListening(false);
      if(event.error !== "aborted" && isMounted && !isSpeakingRef.current){
        setTimeout(()=>{
          if(isMounted){
            try{
              recognition.start()
              console.log("Recognition started");
            }
            catch(e){
              if(e.name != "InvalidStartError"){
                console.log(e)
              }
            }
          }
        },1000);
      }
    };

    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim()

      if (handleLocalCommands(transcript)) return

      if (transcript.toLowerCase().includes(userData.assistantName.toLowerCase())) {
        setAiText("")
        setUserText(transcript)
        recognition.stop()
        isRecognizingRef.current = false
        setListening(false)
        const data = await getGeminiResponse(transcript)
        handleCommand(data)
        setAiText(data.response)
        setUserText("")
  //       setUserData((prev) => ({
  //       ...prev,
  //       history: [
  //         ...(prev.history || []),
  //         `🧑 ${transcript}`,     // user query
  //         `🤖 ${data.response}`, // AI reply
  //       ],
  // }))
      }
    }
      const greeting = new SpeechSynthesisUtterance(`Hello 
        ${userData.name}, what can I help you with?`);
        greeting.lang = 'hi-IN';
        window.speechSynthesis.speak(greeting);

    return () => {
      isMounted = false;
      clearTimeout(startTimeout)
      recognition.stop()
      setListening(false)
      isRecognizingRef.current = false
    }
  }, [])

  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#02023d]
     flex justify-center items-center flex-col gap-[15px] overflow-hidden'>

      <CgMenuRight className='lg:hidden text-white
      absolute top-[20px] right-[20px] w-[25px] h-[25px] '
      onClick={()=>setHam(true)}/>

      <div className={`absolute lg:hidden top-0 w-full h-full bg-[#00000053]
      backdrop-blur-lg p-[20px] flex flex-col gap-[20px] items-start 
      ${ham ? "translate-x-0" : "translate-x-full"} 
      transition-transform`}>

        <RxCross1 className=' text-white
        absolute top-[20px] right-[20px] w-[25px] h-[25px] 
        ' onClick={()=>setHam(false)}/>
        <button className='min-w-[150px] h-[60px] bg-white rounded-full
        text-black cursor-pointer font-semibold text-[19px] '
        onClick={handleLogOut}
        >
          Log Out
        </button>

        <button className='min-w-[150px] h-[60px] bg-white rounded-full
          text-black cursor-pointer font-semibold text-[19px] px-[20px] py-[10px]'
          onClick={() => navigate("/customize")}
        >
          Customize your Assistant
        </button>

        <div className='w-full h-[2px] bg-gray-400'></div>
        <h1 className='text-white font-semibold text-[19px]'>History</h1>
        <div className='w-full h-[400px] gap-[20px] overflow-y-auto flex flex-col '>
          {userData.history?.map((his)=>(
            <span className='text-gray-200 text-[18px] truncate
            mt-[20px]'>{his}</span>
          ))
        }
        </div>
      </div>

      <button className='min-w-[150px] mt-[30px] h-[60px] bg-white rounded-full
        text-black cursor-pointer font-semibold text-[19px] absolute hidden lg:block top-[20px] right-[20px]'
        onClick={handleLogOut}
      >
        Log Out
      </button>

      <button className='min-w-[150px] mt-[30px] h-[60px] bg-white rounded-full
        text-black cursor-pointer font-semibold text-[19px] px-[20px] py-[10px] hidden lg:block absolute top-[100px] right-[20px]'
        onClick={() => navigate("/customize")}
      >
        Customize your Assistant
      </button>

      <div className='w-[300px] h-[400px] flex justify-center
      items-center overflow-hidden rounded-4xl shadow-lg'>
        <img src={userData?.assistantImage} alt=""
          className='h-full object-cover' />
      </div>
      <h1 className='text-white text-[18px] font-semibold'>
        I'm {userData?.assistantName}
      </h1>
      {!aiText && <img src={userImg} alt=""
      className='w-[200px]'/>}
      {aiText && <img src={aiImg} alt=""
      className='w-[200px]'/>}
      <h1 className='text-white text-[18px]
      font-semibold text-wrap'
      >{userText?userText:aiText?aiText:null}</h1>
    </div>
  )
}

export default Home
