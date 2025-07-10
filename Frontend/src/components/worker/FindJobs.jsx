import React, { useEffect, useState } from 'react'
import axios from 'axios'

const FindJobs = () => {
    const [jobs,setJobs]=useState([])
    useEffect(()=>{
        const interval=setInterval(() => {
            fetchJobs();
        }, 4000);

        fetchJobs();

        return ()=>clearInterval(interval)
    },[])
    const fetchJobs=()=>{
        axios.get("/api/v1/service-request/find-requests")
        .then((res)=>{
            setJobs(res.data.data);
        })
        .catch((err)=>{
            console.log("error while finding jobs",err)
            alert("something went wrong when i fetching requests from backend")
        })
    }
  return (
    <div>
        {jobs.length===0 && 
        <div>
            searching...
        </div>
    }
    {jobs.length!==0 && <div className='flex gap-3'>
        {
            jobs.map((job)=>(
                <div id={job} className='h-52 w-80 flex gap-2 bg-gray-400'>
                    <div className='flex flex-col gap-2'>
                        <div>
                            <label htmlFor="">Customer ID : </label>
                            <span>{job.customerId}</span>
                        </div>
                        <div>
                            <label htmlFor="">Category : </label>
                            <span>{job.category}</span>
                        </div>
                    </div>
                    <div>
                        <div>
                            <label htmlFor="">Category : </label>
                            <span>{job.description||"Not Given"}</span>
                        </div>
                        <div>
                            <label htmlFor="">Audio Message : </label>
                            <span>{<audio src="job.audioNoteUrl" controls></audio>||"Not Given"}</span>
                        </div>
                    </div>
                </div>
            ))
        }

    </div>}
    </div>
  )
}

export default FindJobs