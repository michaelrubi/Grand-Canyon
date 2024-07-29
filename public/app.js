// Strict Mode
// "use strict";

// Global Variables
let theme = $('body').attr('class');
let weather = '';


// Functions
/**
 * Fetches the weather data from the OpenWeatherMap API and updates the forecast element with the result.
 *
 * @return {Promise} A promise that resolves with the updated forecast content or rejects with an error message.
 */
function fetchWeather() {
    // Set the API URL and parameters
    const apiUrl = 'https://api.openweathermap.org/data/2.5/weather?';
    const apiKey = '2b53aac8fd28f64dd16fa72648ea5f01';
    const latitude = '36.120015786';
    const longitude = '-111.946716468';
    const units = 'imperial';

    const forecastElement = $('#forecast');

    return $.ajax({
        url: `${apiUrl}lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=${units}`,
        dataType: 'json'
    }).done((data) => {
        const isDayTime = data.dt >= data.sys.sunrise && data.dt <= data.sys.sunset;
        let weather = data.weather[0].main.toLowerCase();
        weather = !isDayTime && weather === 'clear' ? 'night' : weather;
        const description = data.weather[0].description;
        const temperature = data.main.temp;

        const forecastContent = $(`
            <img class="icon" src="/img/icon/${weather}.svg" alt="${description}">
            <span id="temp">
                ${temperature}<span id="unit">°F</span>
            </span>
        `);

        forecastElement.html(forecastContent);
    }).fail((jqXHR) => {
        forecastElement.html('There was a problem loading the forecast.');
        console.error(jqXHR.responseJSON.status_message);
        throw error;
    });
}

/**
 * Sets the theme of the webpage based on the weather data.
 *
 * @param {Object} weather - The weather data containing the current time and sunrise/sunset times.
 * @param {string} [oldTheme=theme] - The current theme of the webpage. Defaults to the value of the `theme` variable.
 * @return {string} The new theme to be applied to the webpage.
 */
function setTheme(weather, oldTheme = theme) {
    const isDayTime = weather.dt >= weather.sys.sunrise && weather.dt <= weather.sys.sunset;
    console.log(`dt ${weather.dt}, sunrise ${weather.sys.sunrise}, sunset ${weather.sys.sunset}`);
    console.log(`isDayTime: ${isDayTime}`);
    const weatherCurrent = weather.weather[0].main.toLowerCase();
    const newTheme = isDayTime? weatherCurrent : 'night';
    $('body').removeClass(`${oldTheme}`).addClass(`${newTheme}`);
    isDayTime ? $('header .logo img').attr('src', 'logo.svg') : $('header .logo img').attr('src', 'logoNight.svg');
    return newTheme;
}

/**
 * Fetches activities from the National Park Service API based on the specified parameters.
 *
 * @return {Promise} A promise that resolves with the fetched activities data or rejects with an error.
 */
function fetchActivities() {
    // Set the API URL and parameters
    const apiURL = 'https://developer.nps.gov/api/v1/places?';
    const apiKey = 'urceLQaoD0APp7OAWa5FxDg7AscaMd0DO9LcYvMO';
    const searchTerm = 'hiking trail';
    const limit = '10';
    const parkCode = 'grca';

    const slidesElement = $('#activities .slides');
    let activitiesContent = '';

    return $.ajax({
        url: `${apiURL}parkCode=${parkCode}&q=${searchTerm}&limit=${limit}&api_key=${apiKey}`,
        dataType: 'json'
    }).done((data) => {
        for (const activity of data.data) {
            const slideContent = `
            <div class="slide">
                <a href=${activity.url} target="_blank">
                    <img src=${activity.images[0].url} alt=${activity.images[0].altText} />
                    <h3>${activity.title}</h3>
                </a>
            </div>
            `
            activitiesContent += slideContent;
        }
        slidesElement.html(activitiesContent);
    }).fail((jqXHR) => {
        console.error(jqXHR.responseJSON.status_message);
        throw error;
    });
}

/**
 * Fetches information from the National Park Service API based on the specified parameters.
 *
 * @return {Promise} A promise that resolves with the fetched information data or rejects with an error.
 */
function fetchInfo() {
    // Set the API URL and parameters
    const apiURL = 'https://developer.nps.gov/api/v1/parks?';
    const apiKey = 'urceLQaoD0APp7OAWa5FxDg7AscaMd0DO9LcYvMO';
    const limit = '10';
    const parkCode = 'grca';
    const stateCode = 'AZ';

    const accordionElement = $('#accordion');
    let accordionContent = '';

    return $.ajax({
        url: `${apiURL}api_key=${apiKey}&limit=${limit}&parkCode=${parkCode}&stateCode=${stateCode}`,
        dataType: 'json'
    }).done((data) => {
        const description = data.data[0].description;
        const entranceFees = data.data[0].entranceFees;
        const entrancePasses = data.data[0].entrancePasses;
        const directions = data.data[0].directionsInfo;
        const directionsURL = data.data[0].directionsUrl;
        const operatingHours = data.data[0].operatingHours;
        const addresses = data.data[0].addresses;
        // Add description
        $('#info .description').html(description);
        // Add entrance fees
        accordionContent += `
            <h3>Entrance Fees</h3>
            <div class="cards">`;
        for (const fee of entranceFees) {
            accordionContent += `
                <div class="card">
                    <h4>${fee.title}</h4>
                    <span>$${fee.cost}</span>
                    <p>${fee.description}</p>
                </div>`;
        }
        // Add pass
        accordionContent += `
            </div>
            <h3>Passes & Directions</h3>
            <div class="cards">`;
        for (const pass of entrancePasses) {
            accordionContent += `
                <div class="card">
                    <h4>${pass.title}</h4>
                    <span>$${pass.cost}</span>
                    <p>${pass.description}</p>
                </div>`;
        }
        // Add directions
        accordionContent += `
            <div class="card">
                    <h4>Directions</h4>
                    <p>${directions}</p>
                    <a href=${directionsURL} target="_blank">Get Directions</a>
                </div>
            </div>
            <h3>Hours</h3>
            <div class="cards">`;
        // Add operating hours
        for (const area of operatingHours) {
            accordionContent += `
                <div class="card">
                    <h4>${area.name}</h4>
                    <p>${area.description}</p>
                </div>`;
        }            
        accordionContent += "</div>";
        accordionElement.html(accordionContent);
        $('#accordion').accordion({
            collapsible: true,
            active: false,
            heightStyle: "content"
        });
    }).fail((jqXHR) => {
        console.error(jqXHR.responseJSON.status_message);
        throw error;
    });
}

/**
 * Updates the carousel's scroll index based on the given direction.
 *
 * @param {string} direction - The direction to scroll the carousel ('left' or 'right').
 * @return {void} This function does not return a value.
 */
function carousel(direction) {
    // carousel selector
    const slides = $('#activities .slides');
    // Set variables for easier maxIndex calculation
    const scrollIndex = Number.parseInt(slides.css('--scroll-index'), 10);
    const slideCount = slides.children().length;
    const slideWidth = slides.find('.slide').outerWidth(true);
    const viewortWidth = window.innerWidth;
    const fullSlidesInView = Math.floor(viewortWidth / slideWidth);
    const slidesInView = (viewortWidth - (fullSlidesInView + 1) * 16 ) / slideWidth;
    
    // Calculate new index
    let newIndex = direction === 'left' ? scrollIndex - 1 : scrollIndex + 1;
    const maxIndex = Math.floor(slideCount / slidesInView);
    newIndex = Math.max(0, Math.min(newIndex, maxIndex));

    // Set new scroll index
    slides.css('--scroll-index', newIndex);
  }

  function resetCarousel() {
    const slides = $('#activities .slides');
    slides.css('--scroll-index', 0);
}


// Event Listeners
$(document).ready(() => {
    fetchActivities();
    fetchInfo();
});


$('#forecast').on('click', async () => {
    try {
        weather = await fetchWeather();

        theme = setTheme(weather);
    } catch (error) {
        console.error(error);
    }
});

$('#activities .right').on('click', () => carousel('right'));
$('#activities .left').on('click', () => carousel('left'));
$(window).on('resize', resetCarousel);
