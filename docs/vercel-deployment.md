# Steps to deploy on Vercel
1. Login using your github on https://vercel.com/
2. Connect your repo  
   <img width="669" alt="Screenshot 2024-07-07 at 3 58 47 PM" src="https://github.com/strkfarm/starkfarm-client/assets/156126180/f6d77b5f-fa91-4dbc-9479-3cdd36558d9a">
3. Most default settings should be good. Just need to add environment variables.
   This list is just a sample, ensure you add all new variables which you used during dev.
   <img width="945" alt="Screenshot 2024-07-07 at 4 00 57 PM" src="https://github.com/strkfarm/starkfarm-client/assets/156126180/395d7a8b-50db-4d90-80e1-c2d88caf6279">
4. Click deploy
5. **If you are doing this deployment to raise a PR**, do this:  
   Once deployed, go to settings => Domain and configure the vercel.app subdomain using this format - "`strkfarm-{{FIRST_5_CHARS_OF_YOUR_GH_USERNAME}}`" (e.g. strkfarm-akira.vercel.app)
   <img width="1255" alt="Screenshot 2024-07-07 at 4 02 34 PM" src="https://github.com/strkfarm/starkfarm-client/assets/156126180/817254bf-c1c1-47d6-97d2-441281226598">
