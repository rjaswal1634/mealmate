Inspiration
Our project is inspired by the daily struggles that college students encounter with meal planning, and also with the growing demand for effective food waste management. Sometimes, students have food, but they don't have a proper schedule to eat that food. As such, food goes bad within one or two days, which contributes to food and money wastage.

What it does
MealMate is an AI-driven fridge ingredient-tracking platform that intelligently suggests various recipes that could be prepared with available items. It assists in dietary and food wastage management. It generates recipes that can be made from the available ingredients. It takes pictures of the food inside the refrigeration and updates the food inventory itself. That inventory of food is later used to analyze recipes and even generate an optional schedule to eat that food.

How we built it
We used Raspberry Pi along with a webcam that can be placed inside the refrigeration to take pictures of available food items. Building upon that we used Firebase to store the data received. Gemini is working to integrate the images into meaningful fun information. Building upon that we used Next.js & React to develop the front end and Auth0 for userlogin. We used Gemini API to suggest things while we used Spoonacular API to generate the food recipes. For domain, we used the mlh Godaddy link. For hosting, we use Cloudflare and a home Linux server. the domain points to the IP of that link server. This saves us the cost of hosting.


How to run this project: 
use `npm innstall` to install all the dependecies. 
use `npm run dev` to test the website. 
use `npm run build` to build the app.
use `npm start` to start your application. 

