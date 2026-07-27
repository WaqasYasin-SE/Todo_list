const API = "/tasks";

const timers = {};



// ================= TOAST MESSAGE =================

function showToast(message){

    let toast = document.getElementById("toast");

    if(!toast) return;


    toast.innerHTML = message;

    toast.classList.add("show");


    setTimeout(()=>{

        toast.classList.remove("show");

    },2500);

}







// ================= OPEN ADD PAGE =================

function showAdd(){

    document.getElementById("home").classList.add("hidden");

    document.getElementById("taskSection").classList.add("hidden");

    document.getElementById("addSection").classList.remove("hidden");

}







// ================= OPEN TASK PAGE =================

function showTasks(){

    document.getElementById("home").classList.add("hidden");

    document.getElementById("addSection").classList.add("hidden");

    document.getElementById("taskSection").classList.remove("hidden");


    loadTasks();

}







// ================= BACK HOME =================

function goBack(){

    document.getElementById("home").classList.remove("hidden");

    document.getElementById("addSection").classList.add("hidden");

    document.getElementById("taskSection").classList.add("hidden");

}








// ================= ADD TASK =================

async function addTask(){


    let title =
    document.getElementById("title").value;


    let deadline =
    document.getElementById("deadline").value;





    if(title.trim()===""){

        showToast("Enter task title");

        return;

    }






    let response = await fetch(API,{

        method:"POST",

        credentials:"include",

        headers:{

            "Content-Type":"application/json"

        },


        body:JSON.stringify({

            title:title,

            deadline:deadline,

            status:"Pending"

        })

    });






    if(response.status===401){

        window.location="/login";

        return;

    }






    if(response.ok){


        document.getElementById("title").value="";

        document.getElementById("deadline").value="";


        showToast("Task saved successfully");


        goBack();


    }



}









// ================= LOAD TASKS =================

async function loadTasks(){



    Object.keys(timers).forEach(id=>{

        clearInterval(timers[id]);

        delete timers[id];

    });







    let res = await fetch(API,{

        credentials:"include"

    });





    if(res.status===401){

        window.location="/login";

        return;

    }





    let data = await res.json();





    let html="";





    if(data.length===0){

        html="<h3>No tasks available</h3>";

    }








    data.forEach(task=>{



        let statusText="";



        if(task.status==="Completed"){

            statusText="✓ Completed";

        }

        else if(task.status==="Overdue"){

            statusText="⚠ Overdue";

        }

        else{

            statusText="⏳ Pending";

        }






        html += `


        <div class="task">


            <div>


                <h3>${task.title}</h3>



                <p>

                Deadline:

                ${
                    task.deadline

                    ?

                    new Date(task.deadline)
                    .toLocaleString()

                    :

                    "No deadline"

                }


                </p>





                <p>

                Status:


                <span class="status ${task.status.toLowerCase()}">

                ${statusText}

                </span>


                </p>





                <p 
                class="timer"
                id="timer-${task.id}">

                ${
                    task.deadline &&
                    task.status==="Pending"

                    ?

                    "Starting..."

                    :

                    ""

                }

                </p>



            </div>







            <div>


            ${
                task.status==="Pending"

                ?

                `

                <button onclick="completeTask(${task.id})">

                Complete

                </button>

                `

                :

                ""

            }





            <button 
            class="delete-btn"
            onclick="deleteTask(${task.id})">

            Delete

            </button>



            </div>


        </div>


        `;



    });







    document.getElementById("taskList").innerHTML=html;







    data.forEach(task=>{


        if(
            task.deadline &&
            task.status==="Pending"
        ){


            startTimer(
                task.id,
                task.deadline
            );


        }


    });



}











// ================= COMPLETE TASK =================


async function completeTask(id){



    if(timers[id]){


        clearInterval(timers[id]);

        delete timers[id];

    }






    let res = await fetch(API,{

        credentials:"include"

    });






    if(res.status===401){

        window.location="/login";

        return;

    }





    let tasks = await res.json();



    let task =
    tasks.find(t=>t.id===id);





    if(!task){

        return;

    }





    let status="Completed";






    if(task.deadline){


        let now =
        new Date().getTime();



        let deadline =
        new Date(task.deadline).getTime();




        if(now > deadline){

            status="Overdue";

        }


    }





    await updateStatus(id,status);



}












// ================= UPDATE STATUS =================


async function updateStatus(id,status){



    await fetch(`/tasks/${id}`,{

        method:"PATCH",

        credentials:"include",


        headers:{


            "Content-Type":"application/json"

        },



        body:JSON.stringify({

            status:status

        })


    });



    loadTasks();



}












// ================= DELETE TASK =================


async function deleteTask(id){



    if(timers[id]){


        clearInterval(timers[id]);

        delete timers[id];


    }






    await fetch(`/tasks/${id}`,{

        method:"DELETE",

        credentials:"include"


    });






    showToast("Task deleted");


    loadTasks();



}












// ================= TIMER =================


function startTimer(id,deadline){



    if(timers[id]){

        clearInterval(timers[id]);

    }






    timers[id]=setInterval(async()=>{



        let now =
        new Date().getTime();



        let end =
        new Date(deadline).getTime();




        let distance=end-now;





        let element =
        document.getElementById(
            `timer-${id}`
        );







        if(!element){


            clearInterval(timers[id]);

            delete timers[id];


            return;

        }







        if(distance<=0){



            element.innerHTML=
            "⚠️ Deadline Passed";




            clearInterval(timers[id]);

            delete timers[id];




            await updateStatus(
                id,
                "Overdue"
            );



            return;


        }






        let hours=Math.floor(

            distance/(1000*60*60)

        );




        let minutes=Math.floor(

            (distance%(1000*60*60))/

            (1000*60)

        );





        let seconds=Math.floor(

            (distance%(1000*60))/

            1000

        );






        element.innerHTML=

        `Remaining: ${hours}h ${minutes}m ${seconds}s`;





    },1000);



}