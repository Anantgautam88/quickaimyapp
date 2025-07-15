

import { clerkClient } from "@clerk/express";
import OpenAI from "openai";
import sql from "../configs/db.js";
import axios from "axios";
import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'
import pdf from 'pdf-parse/lib/pdf-parse.js'


const AI = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

export const generateArticle = async (req,res)=>{
    try {
       const {userId}=req.auth();
       const {prompt,length} = req.body;
       const plan=req.plan;
       const free_usage=req.free_usage;

       if(plan!== 'premium' && free_usage >=10) {
        return res.json({success: false , message: 'You have exceeded your free usage limit'});
       }


       const response = await AI.chat.completions.create({
        model: "gemini-2.0-flash",
        messages: [
           
            {
                role: "user",
                content: prompt,
            },

        ],
        temperature:0.7,
        max_tokens: length,
    });
    const content = response.choices[0].message.content;
     
    await sql ` INSERT INTO creations (user_id ,prompt , content,type)
    VALUES (${userId},${prompt},${content},'article')`;

    if(plan !=='premium') {
        await clerkClient.users.updateUserMetadata(userId,{
            privateMetadata:{
                free_usage:free_usage+1
            }
        })
    }

    res.json({success:true,content})

    }
    catch(error) {
     console.log(error.message)
     res.json({success:false,message:error.message});
    }
}

export const generatBlogTitle = async (req,res)=>{
    try {
       const {userId}=req.auth();
       const {prompt} = req.body;
       const plan=req.plan;
       const free_usage=req.free_usage;

       if(plan!== 'premium' && free_usage >=10) {
        return res.json({success: false , message: 'You have exceeded your free usage limit'});
       }


       const response = await AI.chat.completions.create({
        model: "gemini-2.0-flash",
        messages: [
           
            {
                role: "user",
                content: prompt,
            },

        ],
        temperature:0.7,
        max_tokens: 100,
    });
    const content = response.choices[0].message.content;
     
    await sql ` INSERT INTO creations (user_id ,prompt , content,type)
    VALUES (${userId},${prompt},${content},'blog-title')`;

    if(plan !=='premium') {
        await clerkClient.users.updateUserMetadata(userId,{
            privateMetadata:{
                free_usage:free_usage+1
            }
        })
    }

    res.json({success:true,content})

    }
    catch(error) {
     console.log(error.message)
     res.json({success:false,message:error.message});
    }
}



export const generateImage = async (req,res)=>{
    try {
       const {userId}=req.auth();
       const {prompt,publish} = req.body;
       const plan=req.plan;
    //    const free_usage=req.free_usage;

       if(plan!== 'premium' ) {
        return res.json({success: false , message: 'This feature is avilable only for premium users'});
       }


    //    const response = await AI.chat.completions.create({
    //     model: "gemini-2.0-flash",
    //     messages: [
           
    //         {
    //             role: "user",
    //             content: prompt,
    //         },

    //     ],
    //     temperature:0.7,
    //     max_tokens: 100,
    // });
    // const content = response.choices[0].message.content;()

    const formData = new FormData()
formData.append('prompt', prompt)

const {data}=await axios.post("https://clipdrop-api.co/text-to-image/v1" ,formData,{
    headers:{ 'x-api-key': process.env.CLIPDROP_API_KEY,},
    responseType:"arraybuffer",
})

const base64Image =`data:image/png;base64,${Buffer.from(data,'binary').toString('base64')}`;
  
// Converts the binary image into a base64-encoded string.

// This format lets you show the image in the browser or save it without needing to save a physical .png file.

// The final result, base64Image, looks like this:

// bash
// Copy
// Edit
// data:image/png;base64,iVBORw0K...
const {secure_url}=await cloudinary.uploader.upload(base64Image);
     
    await sql ` INSERT INTO creations (user_id ,prompt , content,type,publish)
    VALUES (${userId},${prompt},${secure_url},'image',${publish ?? false})`;

    if(plan !=='premium') {
        await clerkClient.users.updateUserMetadata(userId,{
            privateMetadata:{
                free_usage:free_usage+1
            }
        })
    }

    res.json({success:true,content: secure_url})

    }
    catch(error) {
     console.log(error.message)
     res.json({success:false,message:error.message});
    }
}

export const removeImageBackground = async (req,res)=>{
    try {
       const {userId}=req.auth();
       const image =req.file;
       const plan=req.plan;
    //    const free_usage=req.free_usage;

       if(plan!== 'premium' ) {
        return res.json({success: false , message: 'This feature is avilable only for premium users'});
       }


    const {secure_url}=await cloudinary.uploader.upload(image.path , {
        transformation:[
            {
                effect:"background_removal",
                background_removal: "remove_the_background"
            }
        ]
    });

   
     
    await sql ` INSERT INTO creations (user_id ,prompt , content,type)
    VALUES (${userId},'Remove Background from image',${secure_url},'image')`;

    if(plan !=='premium') {
        await clerkClient.users.updateUserMetadata(userId,{
            privateMetadata:{
                free_usage:free_usage+1
            }
        })
    }

    res.json({success:true,content: secure_url})

    }
    catch(error) {
     console.log(error.message)
     res.json({success:false,message:error.message});
    }
}

export const removeImageObject = async (req,res)=>{
    try {
       const {userId}=req.auth();
       const {object}=req.body;
       const image =req.file;
       const plan=req.plan;
    //    const free_usage=req.free_usage;

       if(plan!== 'premium' ) {
        return res.json({success: false , message: 'This feature is avilable only for premium users'});
       }


    const {public_id}=await cloudinary.uploader.upload(image.path);

    const imageurl= cloudinary.url(public_id,{
        transformation: [{effect: `gen_remove:${object}`}],
        resource_type: 'image'
    })

   
     
    await sql ` INSERT INTO creations (user_id ,prompt , content,type)
    VALUES (${userId},${`Removed ${object} from image`},${imageurl},'image')`;

    if(plan !=='premium') {
        await clerkClient.users.updateUserMetadata(userId,{
            privateMetadata:{
                free_usage:free_usage+1
            }
        })
    }

    res.json({success:true,content: imageurl})

    }
    catch(error) {
     console.log(error.message)
     res.json({success:false,message:error.message});
    }
}

export const resumeReview = async (req,res)=>{
    try {
       const {userId}=req.auth();

       const resume =req.file;
       const plan=req.plan;
    //    const free_usage=req.free_usage;

       if(plan!== 'premium' ) {
        return res.json({success: false , message: 'This feature is avilable only for premium users'});
       }


    if(resume.size> 5*1024*1024) {
        return res.json({success: false , message: 'Resume size should be less than 5MB'})
    }
    const dataBuffer=fs.readFileSync(resume.path)
     const pdfData =await pdf(dataBuffer)
    //  Reads the PDF file into a binary buffer (a low-level data format Node.js understands).

    //  resume.path is the location of the uploaded file on your server (via multer).

     const prompt=`Review the following Resume and Provide constructive feedback on its strengths,weaknesses, and areas for improvement.ResumeContent:\n\n${pdfData.text}`

    //  Uses the pdf-parse library to convert the PDF buffer into readable text.

    //  pdfData.text contains the entire text of the resume.
     
     

     const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [
               
                {
                    role: "user",
                    content: prompt,
                },
    
            ],
            temperature:0.7,
            max_tokens: 1000,
        });
        const content = response.choices[0].message.content;






    await sql ` INSERT INTO creations (user_id ,prompt , content,type)
    VALUES (${userId},'Review the uploaded resume',${content},'resume-review')`;

    if(plan !=='premium') {
        await clerkClient.users.updateUserMetadata(userId,{
            privateMetadata:{
                free_usage:free_usage+1
            }
        })
    }

    res.json({success:true,content})

    }
    catch(error) {
     console.log(error.message)
     res.json({success:false,message:error.message});
    }
}

