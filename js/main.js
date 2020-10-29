'use strict';

const RED_COLOR = 'red'

const cartButton = document.querySelector("#cart-button");
const modal = document.querySelector(".modal");
const close = document.querySelector(".close");
const buttonAuth = document.querySelector('.button-auth');
const closeAuth = document.querySelector('.close-auth');
const modalAuth = document.querySelector('.modal-auth');
const loginForm = document.querySelector('#logInForm');
const loginInput = document.querySelector('#login');
const passwordInput = document.querySelector('#password');
const userName = document.querySelector('.user-name');
const buttonOut = document.querySelector('.button-out');
const cardsRestaurants = document.querySelector('.cards-restaurants');
const containerPromo = document.querySelector('.container-promo');
const restaurants = document.querySelector('.restaurants');
const menu = document.querySelector('.menu');
const logo = document.querySelector('.logo');
const cardsMenu = document.querySelector('.cards-menu');
const restaurantTitle = document.querySelector('.restaurant-title');
const restauranRating = document.querySelector('.rating');
const restaurantPrice = document.querySelector('.price');
const restaurantCategory = document.querySelector('.category');
const inputSearch = document.querySelector('.input-search');




let login = localStorage.getItem('gloDelivery');

const getData = async function(url) {

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Ошибка по адресу ${url},
    статус ошибки ${response.status}!`);
  }

  return await response.json();

};

function validName (str) {
  const regName = /^[a-zA-Z][a-zA-Z0-9-_\.]{1,20}$/;
  return regName.test(str);
};

function toggleModal() {
  modal.classList.toggle("is-open");
}

function toggleModalAuth() {
  loginInput.style.borderColor = '';
  modalAuth.classList.toggle('is-open');
  if (modalAuth.classList.contains('is-open')) {
      disableScroll();
  } else {
      enableScroll();
  }
}

function authorized() {

  function logOut() {
    login = null;    
    localStorage.removeItem('gloDelivery');
    buttonAuth.style.display = '';
    userName.style.display = '';
    buttonOut.style.display = '';
    buttonOut.removeEventListener('click', logOut);
    checkAuth();
  }

  console.log('Авторизован');

  userName.textContent = login;

  buttonAuth.style.display = 'none';
  userName.style.display = 'inline';
  buttonOut.style.display = 'block';

  buttonOut.addEventListener('click', logOut);
}

function notAuthorized() {
  console.log('Не авторизован');

  function logIn(event) {
    event.preventDefault();

    if (validName(loginInput.value)) {
      login = loginInput.value;
      localStorage.setItem('gloDelivery', login);

      toggleModalAuth();

      buttonAuth.removeEventListener('click', toggleModalAuth);
      closeAuth.removeEventListener('click', toggleModalAuth);
      logInForm.removeEventListener('submit', logIn);
      loginForm.reset();
      checkAuth();
    } else {
      loginInput.style.borderColor = RED_COLOR;
      alert('Введите верный логин');
    }
  }

  buttonAuth.addEventListener('click', toggleModalAuth);
  closeAuth.addEventListener('click', toggleModalAuth);
  logInForm.addEventListener('submit', logIn);
  modalAuth.addEventListener('click', function (event) {
    if (event.target.classList.contains('is-open')) {
      toggleModalAuth()
    }
  });

}

function checkAuth() {
  if (login) {
   authorized();
  } else {
   notAuthorized();
  }
}

function createCardRestaurant({ image, 
  kitchen, 
  name, 
  price,
  stars,
  products,
  time_of_delivery: timeOfDelivery }) {
  
    const cardRestaurant = document.createElement('a');
    cardRestaurant.className = 'card card-restaurant';
    cardRestaurant.products = products;
    cardRestaurant.info = { kitchen, name, price, stars };

    const card = `
    <img src="${image}" alt="image" class="card-image"/>
    <div class="card-text">
      <div class="card-heading">
        <h3 class="card-title">${name}</h3>
        <span class="card-tag tag">${timeOfDelivery} мин</span>
      </div>
      <div class="card-info">
        <div class="rating">
          ${stars}
        </div>
        <div class="price">От ${price} ₽</div>
        <div class="category">${kitchen}</div>
      </div>
    </div>
    `;

    cardRestaurant.insertAdjacentHTML('beforeend', card);
    cardsRestaurants.insertAdjacentElement('beforeend', cardRestaurant);

}

function createCardGood({ description, image, name, price }) {

  const card = document.createElement('div');
  card.className = 'card';

  card.innerHTML = `
						<img src="${image}" alt="image" class="card-image"/>
						<div class="card-text">
							<div class="card-heading">
								<h3 class="card-title card-title-reg">${name}</h3>
							</div>
							<div class="card-info">
								<div class="ingredients">${description}
								</div>
							</div>
							<div class="card-buttons">
								<button class="button button-primary button-add-cart">
									<span class="button-card-text">В корзину</span>
									<span class="button-cart-svg"></span>
								</button>
								<strong class="card-price-bold">${price} ₽</strong>
							</div>
						</div>
  `;

  cardsMenu.insertAdjacentElement('beforeend', card);

}

function openGoods(event) {

  const target = event.target;
  const restaurant = target.closest('.card-restaurant');

  if (restaurant && login) {
    
    cardsMenu.textContent = '';
    containerPromo.classList.add('hide');
    restaurants.classList.add('hide');
    menu.classList.remove('hide');

    const { name, kitchen, price, stars } = restaurant.info;

    restaurantTitle.textContent = name;
    restauranRating.textContent = stars;
    restaurantPrice.textContent = `От ${price} ₽`;
    restaurantCategory.textContent = kitchen;
    
    getData(`./db/${restaurant.products}`)
     .then(function(data) {
      data.forEach(createCardGood);
    });

  } else {
    toggleModalAuth();
    //modalAuth.classList.toggle("is-open");
  }

  
}

function closeGoods() {

    containerPromo.classList.remove('hide')
    restaurants.classList.remove('hide')
    menu.classList.add('hide')   

}

function init() {

  getData('./db/partners.json')
  .then(function(data) {
      data.forEach(createCardRestaurant);

});

cartButton.addEventListener("click", toggleModal);

close.addEventListener("click", toggleModal);

cardsRestaurants.addEventListener('click', openGoods);

logo.addEventListener('click', closeGoods);

checkAuth();

inputSearch.addEventListener('keypress', function(event) {
  if (event.charCode === 13) {
    const value = event.target.value.trim();

    if (!value) {
      return;
    }
    
     getData('./db/partners.json')
      .then(function (data) {
        return data.map(function (partner) {
         return partner.products;
        });
      })
      .then(function (linksProduct) {
          cardsMenu.textContent = '';
          linksProduct.forEach(function (link) {
            getData(`./db/${link}`)
              .then(function (data) {       
                const resultSearch = data.filter(function (item) {
                  const name = item.name.toLowerCase();
                  return name.includes(value.toLowerCase());
                })
                
                containerPromo.classList.add('hide');
                restaurants.classList.add('hide');
                menu.classList.remove('hide');
                
                restaurantTitle.textContent = `Результат поиска по запросу "${value}"`;
                restauranRating.textContent = '';
                restaurantPrice.textContent = '';
                restaurantCategory.textContent = '';
                resultSearch.forEach(createCardGood);
              })
          })
        console.log(linksProduct);
      })
  }
});

// Slider

const swiper = new Swiper('.swiper-container', {
  slidesPerView: 1,
  loop: true,
  autoplay: true,
  effect: 'cube',
  cubeEffect:{
    shadow:false,
  },
});

};

init();