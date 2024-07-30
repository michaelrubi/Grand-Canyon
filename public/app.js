// Strict Mode
// "use strict";

// Global Variables
let theme = $('body').attr('class');
let weather;
let currentIndex = 0;

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
    if (isDayTime) {
        $('header .logo img').attr('src', 'logo.svg');
        $('footer .logo img').attr('src', 'logoDayFooter.svg');
        
    } else {
        $('header .logo img').attr('src', 'logoNight.svg');
        $('footer .logo img').attr('src', 'logoNightFooter.svg');
    }
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

    const addressElement = $('footer .address');

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

        const address = data.data[0].addresses[0];
        console.log(address);
        const addressContent = `
            <address>
                <small>${address.line1}<br/>${address.line2}<br/>${address.city}, ${address.stateCode} ${address.postalCode} ${address.countryCode}</small>
            </address>
            `;
        addressElement.html(addressContent);
        

    }).fail((jqXHR) => {
        console.error(jqXHR.responseJSON.status_message);
        throw error;
    });
}

/**
 * Updates the position of the carousel based on the current index.
 *
 * @return {void} This function does not return anything.
 */
function updateCarousel() {
    const slides = $('#activities .slides');
    const slideWidth = $('.slide').outerWidth(true);
    slides.css('transform', `translateX(-${currentIndex * slideWidth}px)`);
}

/**
 * Updates the carousel based on the given direction.
 *
 * @param {string} direction - The direction to move the carousel ('right' or 'left').
 * @return {void} This function does not return anything.
 */
function carousel(direction) {
    const slides = $('#activities .slides');
    const slideCount = slides.children().length;
    const visibleSlides = Math.floor(slides.width() / $('.slide').outerWidth(true));

    if (direction === 'right' && currentIndex < slideCount - visibleSlides) {
        currentIndex++;
    } else if (direction === 'left' && currentIndex > 0) {
        currentIndex--;
    }
    updateCarousel();
}


// Event Listeners
$(document).ready(async () => {
    fetchActivities();
    fetchInfo();
    try {
        weather = await fetchWeather();
        theme = setTheme(weather);
    } catch (error) {
        console.error(error);
    }
});

$('#activities .right').on('click', () => carousel('right'));
$('#activities .left').on('click', () => carousel('left'));
$(window).on('resize', updateCarousel);
