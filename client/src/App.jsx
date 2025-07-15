import React, { useEffect } from 'react'
import { Routes,Route } from 'react-router-dom'
import Writearticle from './pages/Writearticle'
import Blogtitles from './pages/Blogtitles'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Layout from './pages/Layout'
import GenerateImages from './pages/GenerateImages'
import Removebackground from './pages/Removebackground'
import RemoveObject from './pages/RemoveObject'
import ReviewResume from './pages/ReviewResume'
import Community from './pages/Community'
import { useAuth } from '@clerk/clerk-react'
import {Toaster} from 'react-hot-toast'
const App = () => {




  return (
    <div>
      <Toaster/>
      <Routes>
         <Route path='/' element={<Home />} />
          <Route path='/ai' element={<Layout/>}>
          <Route index element={<Dashboard/>} />
          <Route path='write-article' element={<Writearticle/>}/>
          <Route path='blog-titles' element={<Blogtitles/>}/>
          <Route path='generate-images' element={<GenerateImages/>}/>
          <Route path='remove-background' element={<Removebackground/>}/>
          <Route path='remove-object' element={<RemoveObject/>}/>
          <Route path='review-resume' element={<ReviewResume/>}/>
          <Route path='community' element={<Community/>}/> 
             
         </Route>
      </Routes>
    
      
      </div>
  )
}

export default App