const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");
const grantAccessContainer = document.querySelector(
  ".grant-location-container"
);
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const errorContainer = document.querySelector(".error-container");

//initial variables needed
let currentTab = userTab;
const API_KEY = "26eb016dd038445997eea0d31c7bb8b2";
currentTab.classList.add("current-tab");
getFromSessionStorage();

function switchTab(clickedTab) {
  if (clickedTab != currentTab) {
    currentTab.classList.remove("current-tab");
    currentTab = clickedTab;
    currentTab.classList.add("current-tab");

    if (!searchForm.classList.contains("active")) {
      // if search form didnot had active class meaning your weather was current tab so make it
      // invisible and make search weather tab visible
      errorContainer.classList.remove("active");
      userInfoContainer.classList.remove("active");
      grantAccessContainer.classList.remove("active");
      searchForm.classList.add("active");
    } else {
      // if search form had active class meaning search weather was current tab so make it
      // invisible and make your weather tab visible
      errorContainer.classList.remove("active");
      searchForm.classList.remove("active");
      userInfoContainer.classList.remove("active");
      // now i am in your weather tab so lets check local storage for coordinates of my current
      // location if we have them saved there
      getFromSessionStorage();
    }
  }
}

userTab.addEventListener("click", () => {
  // pass clicked tab as input parameter
  switchTab(userTab);
});

searchTab.addEventListener("click", () => {
  // pass clicked tab as input parameter
  switchTab(searchTab);
});

function getFromSessionStorage() {
  let localCoordinates = sessionStorage.getItem("user-coordinates");
  if (!localCoordinates) {
    // if loacalCoordinates not found
    grantAccessContainer.classList.add("active");
  } else {
    // if localCoordinates found
    const coordinates = JSON.parse(localCoordinates);
    fetchUserWeatherInfo(coordinates);
  }
}

async function fetchUserWeatherInfo(coordinates) {
  const { lat, lon } = coordinates;
  //make grantAccessContainer invisible
  grantAccessContainer.classList.remove("active");
  //make loading screen visible
  loadingScreen.classList.add("active");

  // API CALL
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();

    // make loading screen invisible
    loadingScreen.classList.remove("active");
    // make your weather screen visible
    userInfoContainer.classList.add("active");
    renderWeather(data);
  } catch (error) {
    // make loading screen invisible
    loadingScreen.classList.remove("active");
    userInfoContainer.classList.remove("active");
    // HW
    alert(`Cant load weather data due to this error = ${error}`);
  }
}

function capitalizeFirstLetterOfEachWord(str) {
  return str
    .toLowerCase()
    .split(" ")
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function renderWeather(weatherInfo) {
  // fetching the elements which render weather information
  const cityName = document.querySelector("[data-cityName]");
  const countryIcon = document.querySelector("[data-countryIcon]");
  const weatherDesc = document.querySelector("[data-weatherDesc]");
  const weatherIcon = document.querySelector("[data-weatherIcon]");
  const temp = document.querySelector("[data-temp]");
  const windspeed = document.querySelector("[data-windspeed]");
  const humidity = document.querySelector("[data-humidity]");
  const cloudiness = document.querySelector("[data-cloudiness]");

  // fetching values from weatherInfo object and rendering them in UI elements
  cityName.innerText = weatherInfo?.name;
  countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
  weatherDesc.innerText = capitalizeFirstLetterOfEachWord(
    weatherInfo?.weather?.[0]?.description
  );
  weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
  temp.innerText = `${weatherInfo?.main?.temp.toFixed(2)} °C`;
  windspeed.innerText = `${weatherInfo?.wind?.speed}m/s`;
  humidity.innerText = `${weatherInfo?.main?.humidity}%`;
  cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    // HW - the browser has no geolocation support available
    alert(`The browser has no geolocation support available`);
  }
}

function showPosition(position) {
  const userCoordinates = {
    lat: position?.coords?.latitude,
    lon: position?.coords?.longitude,
  };

  sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
  fetchUserWeatherInfo(userCoordinates);
}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);

const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  errorContainer.classList.remove("active");
  let cityName = searchInput.value;

  if (cityName === "") return;
  else fetchSearchWeatherInfo(cityName);
});

async function fetchSearchWeatherInfo(city) {
  loadingScreen.classList.add("active");
  userInfoContainer.classList.remove("active");
  grantAccessContainer.classList.remove("active");

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();
    searchInput.value = "";
    loadingScreen.classList.remove("active");
    errorContainer.classList.remove("active");
    userInfoContainer.classList.add("active");
    renderWeather(data);
  } catch (error) {
    console.log(error);
    // make loading screen invisible
    loadingScreen.classList.remove("active");
    userInfoContainer.classList.remove("active");
    // HW
    errorContainer.classList.add("active");
  }
}
