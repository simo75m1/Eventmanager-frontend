import { API_URL } from "../../settings.js";
import { handleHttpErrors, makeOptions } from "../../utils.js";
const URL = `${API_URL}/event`
let modal;
let eventData;

export function initEvent(){
    fetchEvents()
    modal = document.getElementById("event-modal")
    document.getElementById("add-event-open").addEventListener("click", openAddEventModal)
    document.getElementById("search-submit-btn").addEventListener("click", openInfoModal)
    document.getElementById("signup-event-open").addEventListener("click", openSignupModal)
}

async function fetchEvents(){
    const data = await fetch(URL, makeOptions("GET", null, false)).then(handleHttpErrors)
    eventData = data;
    const eventTables = data.map(event => 
        `
        <tr>
            <td>${event.id}</td>
            <td>${event.name}</td>
            <td>${event.date}</td>
            <td>${event.description}</td>
            <td>${event.remainingSpots}</td>
            <td><button class="event-btn" id="event_${event.id}">Read more</button></td>
        </tr>
        `).join('')
        document.getElementById("event-data").innerHTML = eventTables;
        setupInfoEventHandlers();
}
function openAddEventModal(){
    const addModalSetup = 
    `<span class="close">&times;</span>
    <label>Name</label>
    <input id="name-add-field" type="text" value="" placeholder="e.g. Roskilde festival...">
    <label>Date</label>
    <input id="date-add-field" type="text" value="" placeholder="dd-MM-yyyy">
    <label>Description</label>
    <input id="description-add-field" type="textarea" value="" placeholder="e.g. Notes, info etc...">
    <label>Max Capacity</label>
    <input id="capacity-add-field" type="text" placeholder="e.g. 4000">
    <button id="add-event-btn">Add Event</button>
    `
    document.getElementById("modal-content").innerHTML = addModalSetup;
    const closeBtn = document.querySelector(".close");
    closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
    })
    document.getElementById("add-event-btn").addEventListener("click", submitAddEvent)

    modal.style.display = "block";
}
async function openInfoModal(eventId){
    const data = await fetch(`${URL}/${eventId}`, makeOptions("GET", null, false)).then(handleHttpErrors)
    const infoModalSetup = 
    `<span class="close">&times;</span>
    <button id="start-edit-button">Edit event</button>
    <label>Id</label>
    <input id="id-edit-field" type="text" value="${data.id}" disabled>
    <label>Name</label>
    <input id="name-edit-field" type="text" value="${data.name}" disabled>
    <label>Date</label>
    <input id="date-edit-field" type="text" value="${data.date}" placeholder="dd-MM-yyyy" disabled>
    <label>Description</label>
    <input id="description-edit-field" type="textarea" value="${data.description}" disabled>
    <label id="capacity-label" style="display:none;">Max Capacity</label>
    <input id="capacity-edit-field" type="number" placeholder="e.g. 4000" style="display:none;">
    
    <button id="edit-save-btn" style="display:none;">Save Changes</button>
    <br>
    <button id="edit-delete-btn" style="display:none;">Delete Event</button>

    `
    document.getElementById("modal-content").innerHTML = infoModalSetup;
    const closeBtn = document.querySelector(".close");
    closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
    })
    document.getElementById("start-edit-button").addEventListener("click", openEditingFields)

    modal.style.display = "block";
}


async function openSignupModal(){
    const attendeeData = await fetch(`${API_URL}/attendee`,makeOptions("GET", null, false)).then(handleHttpErrors)
    const signupModalSetup = 
    `
    <span class="close">&times;</span>
    <label>Choose Attendee</label>
    <select id="attendee-dropdown">
        
    </select>
    <label>Choose Event</label>
    <select id="event-dropdown">

    </select>
    <button id="signup-event-submit-btn">Save</button>
    `
    document.getElementById("modal-content").innerHTML = signupModalSetup;
    const closeBtn = document.querySelector(".close");
    closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
    })
    document.getElementById("signup-event-submit-btn").addEventListener("click", submitSignupForEvent)
    populateDropdownsForSignup(attendeeData)
    
    modal.style.display = "block";

}

async function submitSignupForEvent(){
const chosenAttendee = document.getElementById("attendee-dropdown").value;
const chosenEvent = document.getElementById("event-dropdown").value;

const newSignup = {
    username : chosenAttendee,
    eventId : chosenEvent
}

try {
    const response = await fetch(`${API_URL}/attend-event`, makeOptions("POST", newSignup, false)).then(handleHttpErrors)
    console.log(response)
} catch (error) {
    console.error(error)
}
fetchEvents();

}
function populateDropdownsForSignup(attendeeData){
    document.getElementById("attendee-dropdown").innerHTML = attendeeData.map(attendee => 
        `
            <option value="${attendee.username}">${attendee.username}</option>
        `).join('')


    document.getElementById("event-dropdown").innerHTML = eventData.map(event => 
        `
            <option value="${event.id}">${event.name} - ${event.date}</option>
        `).join('')
}

async function submitAddEvent(){
    const name = document.getElementById("name-add-field").value
    const date = document.getElementById("date-add-field").value
    const description = document.getElementById("description-add-field").value
    const capacity = document.getElementById("capacity-add-field").value

    const newEvent = {
        name : name,
        date : date,
        description : description,
        capacity : capacity
    }
    try {
        await fetch(URL, makeOptions("POST", newEvent, false)).then(handleHttpErrors)
    } catch (error) {
        console.error(error)
    }
    fetchEvents();
    modal.style.display = "none";
}


async function submitEditEvent(){
    // const id = document.getElementById("id-edit-field").value
    // const name = document.getElementById("name-edit-field").value
    // const date = document.getElementById("date-edit-field").value
    // const description = document.getElementById("description-edit-field").value
}

async function submitDeleteEvent(){}


function openEditingFields(){
    document.getElementById("name-edit-field").disabled = false;
    document.getElementById("date-edit-field").disabled = false;
    document.getElementById("description-edit-field").disabled = false;
    document.getElementById("capacity-edit-field").style.display = "block";
    document.getElementById("capacity-label").style.display = "block";
    document.getElementById("edit-save-btn").style.display = "block";
    document.getElementById("edit-save-btn").addEventListener("click", submitEditEvent)
    
    document.getElementById("edit-delete-btn").style.display = "block";
    document.getElementById("edit-delete-btn").addEventListener("click", submitDeleteEvent)
}

function setupInfoEventHandlers(){
    const eventButtons = document.querySelectorAll(".event-btn");
    for(let i=0; i<eventButtons.length; i++){
        eventButtons[i].addEventListener("click", (evt) => {
            const target = evt.currentTarget;
            if (!target.id.includes("event_")) {
                return;
              }
            const id = target.id.replace("event_", "")
            openInfoModal(id);

        })
    }
}