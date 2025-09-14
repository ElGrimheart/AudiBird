
## Prerequisites

- **WiFI connection**

### Edge Device
- **Raspberry Pi 5 4GB complete with Raspbian OS and Python 3.11 installed**
- **USB microphone**

### Server and Frontend Device
- **Node.js** 
- **npm** 
- **PostgreSQL**
- **Internet browser** 

#### Recommended
- **SSH connection with Raspberry Pi**
- **pgAdmin4**

---

## Basic Setup Instructions - for detailed walkthrough and user guide see https://github.com/ElGrimheart/AudiBird


### 1. Database (PostgreSQL)

#### Due to difficulties encounted during database migration, the database may need to be re-constructed in stages.####


- (Optional) Create a Login Role and password for PostgreSQL. 
For demonstration purposes, the database has been exported using the default `postgres` user priveleges, so custom
user role and password should not be required.


Within pgAdmin4 Object Explorer sidebar:
- Create a new database by right-clicking on "Databases", select "Create->Database..." from the menu
- Enter a name for the database (recommended: `audibird_db`), click "Save"

##### Full Database Reconstruction #####
First attempt to restore the full database:
- Right click the database name, select "Restore..." from the menu
In the pop up window:
- Select Format: "Custom or tar" from the drop down selector
- Using the provided file explorer, select the `server/sql/audibird_db` file
- In the Data Options tab, select: "Pre-data", "Data" and "Post-data"
- Click "Restore"

If this process fails, follow the below additional steps.


###### Staged Reconstruction Step 1 - Create database structure
- Delete the previous failed database instance

- Create a new database by right-clicking on "databases", select Create->Database... from the menu
- Enter a name for the database (recommended: `audibird_db`), click "Save"

- Right click the database name, select "Restore..." from the menu
In the pop up window:
- Select Format: "Custom or tar" from the drop down selector
- Using the provided file explorer, select the `server/sql/audibird_no_data` file
- In the Data Options tab, select: "Pre-data" and "Post-data"
- Click "Restore"

This should create the database structure, creating a total of 15 tables. 
To check, use the sidebar to expand database_name->Schemas->public->Tables.

###### Staged Reconstruction Step 2 - Restore database data
- Right click the database name, select "Restore..." from the menu
- Select format: "Plain"
- Using the provided file explorer, select the `server/sql/audibird_plain_data` file
- Click "Restore"

This should re-populate the data within the database. 
To check, use the sidebar to expand database_name->Schemas->public->Tables. Right click each table and select "Count Rows".

*If any tables are empty then repeat Step 2 until all tables are populated*


#### Update server .env configuration ####
Once the database has been reconstructed:
- Right click PostgresSQL, select "Properties" and "Connection" tab
- Update the database configuration in `audibird/server/.env` to match your database host, port and database name (optional - update the .env with your custom username and password if utilised)


### 2. Server (Node.js Backend)
To determine your devices ip address
- Open a terminal and enter command:
    ipconfig/all

- Update the backend server configuration within  `server/.env` to match your ip address and desired port

Using the terminal and navigate to `audibird/server`
- To install the node packages, enter command:
    npm install

- To launch the backend server and service workers, enter command:
    npm run all


### 3. Client (React Frontend)
- Update the configuration within `client/.env` to match your backend server ip address and port

- Update the host field within `client/vite.config.js` to match your ip address

- Update the frontend configuration within `server/.env` to match your frontend url

- Open a second terminal and navigate to `audibird/client`
- To install the node packages, enter command:
    npm install

- To launch the frontend server, enter command:
    npm run dev

To confirm that the backend and frontend server are correctly configured, open a browser and navigate to
    http://<FRONTEND_IP>:<FRONTEND_PORT>
this should load the Audibird landing page

If the landing page does not load, check that enviornmental variables within `server/.env` and `client/.env`
are consistent and match your device ip address


### 4. Station (Raspberry Pi)

- For guide to setting up a Raspberry Pi, installing operating system and setting up SSH connection see
    https://www.raspberrypi.com/documentation/computers/getting-started.html

- For guide to installing Python on a Raspberry Pi, see 
    https://projects.raspberrypi.org/en/projects/generic-python-install-python3#linux


Once the Raspberry Pi is set up
- Create a new folder named "audibird"
- Copy the entire `station/` folder to the "audibird" folder on the Pi

- Configure environment variables in `station/.env` to match the backend server host and port

In a terminal on the Pi, navigate to the `station/` folder:  
- To create a new virtual environment, enter command:
    python3 -m venv .venv

- Activate the virtual environment, enter command:
    source .venv/bin/activate

- Confirm virtual environment is active, enter command:
    pip --verion
Active path should show the current audibird folder location, 
e.g. pip 23.0.1 from /home/pibird/audibird/station/.venv/lib/python3.11/site-packages/pip

- Install the required python modules, enter command:
    pip install --upgrade pip
    pip install -r requirements.txt

- Once all python modules have been installed, ensure the backend server is running and start the station server:
    python -m main


---


### Demonstation setup
- Login details for existing user accounts and registered stations can be found within `server/sql/user-credentials.txt`
- For demonstration purposes use login credentials for "cforeman01@qub.ac.uk"
- For demonstration purposes, station is pre-loaded with "Development Station" configuration. See detailed user guide on GitHub repo for details on how to swap between pre-set station configurations or process for creating and registering a new station.
- To reduce the file size of the submission, only a small sample of detection audio recordings are included. The full set of audio recordings for the demonstration data can be downloaded from the `station/data/recordings` folder of the GitHub repository. Copy these to the `station/data/recordings` folder on the Pi.


## Environment Variables
- See `.env` files in each folder for configuration options.
- Update IP addresses and ports to match your network setup.

---

## Folder Structure
- `client/` - React frontend
- `server/` - Node.js backend
- `station/` - Python detection node (for Raspberry Pi)

---

## Key Commands
- **Server**: `npm run all` 
- **Client**: `npm run dev` 
- **Station**: `python main.py` (after activating venv)

---

## Troubleshooting
- Ensure all environment variables are set correctly.
- Check that PostgreSQL is running and accessible.
- For Raspberry Pi, ensure Python 3.11 is installed and venv is activated
