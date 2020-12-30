const express = require("express");
const session = require("express-session");
const passport = require("passport");
const WebAppStrategy = require("ibmcloud-appid").WebAppStrategy;
const bodyParser = require("body-parser");
const path = require("path");
const { nextTick } = require("process");
const Cloudant = require("@cloudant/cloudant");

const app = express();

const port = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({
	extended: true
  }));


  app.set("view engine", "ejs");

  // Setup express application to use express-session middleware
  // Must be configured with proper session storage for production
  // environments. See https://github.com/expressjs/session for
  // additional documentation
  app.use(session({
	  secret: "123456",
	  resave: true,
	  saveUninitialized: true,
  }));
  
  // Configure express application to use passportjs
  app.use(passport.initialize());
  app.use(passport.session());
  
  
  // Configure passportjs with user serialization/deserialization. This is required
  // for authenticated session persistence accross HTTP requests. See passportjs docs
  // for additional information http://passportjs.org/docs
  passport.serializeUser((user, cb) => cb(null, user));
  passport.deserializeUser((obj, cb) => cb(null, obj));
  passport.use(new WebAppStrategy({
	  clientId: "512b7410-8004-49f1-ba84-a41f062e164d",
		tenantId: "b5ed024e-1cfe-45bf-b3d7-bfa2690a0d3a",
		secret: "YjNiM2UyY2QtNzhjMy00YmUyLWFjMzktNzE4MDFkMThjNmJl",
	  oAuthServerUrl: "https://us-south.appid.cloud.ibm.com/oauth/v4/b5ed024e-1cfe-45bf-b3d7-bfa2690a0d3a",
	  redirectUri: "https://code30.mybluemix.net/appid/login"
  }));




cloudant();

async function cloudant() {
	console.log("Cloudant test");
	try {
		console.log("Creating cloudant connection");
		const cloudant = Cloudant ({
			url: "https://fea9e7d7-e236-445f-85b5-d9a693a53faa-bluemix.cloudantnosqldb.appdomain.cloud",
			plugins: {
				iamauth: {
					iamApiKey: "4auxesXxh9nbCw3CQ59N-0xQpi9j2Fn10G64Kn6qzByo"
				}
			}
		})
		console.log("Created cloudant connection success");

		console.log("Getting cloudant dbs");
		let allDBS = await cloudant.db.list();
		console.log(`Cloudant dbs ${allDBS}`)

		console.log("Setting up snippet DB");
		const db = cloudant.db.use("code30-snippets");

		const doc0 = { "_id":"testUser:user1", "title":"test snippet title doc0", "content":"test content doc0" };

		const bulk = [
			{ "_id":"testUser:user2", "title":"test snippet title doc2", "content":"test content doc2" },
			{ "_id":"testUser:user3", "title":"test snippet title doc3", "content":"test content doc3" },
			{ "_id":"testUser:user4", "title":"test snippet title doc4", "content":"test content doc4" }
		]

		let res = "";


		console.log("Delete Doc from db");
		res = await db.destroy("testUser:user2", "1-94bbae096302c742b57a5b2694237742");
		console.log(res);


		console.log("Get all docs from db");
		res = await db.list({include_docs:true});
		console.log(res);


		// console.log("Getting the docs by partition ID");
		// res = await db.partitionedList("testUser", {include_docs:true});
		// console.log(res);


		// res = await db.insert(doc0);
		// console.log(res);
		// console.log(`Added doc to database ${res}`);


		// res = await db.bulk ({docs:bulk});
		// console.log(res);
		// console.log(`Added bulk docs to db ${res}`);


		// console.log("Get doc from db");
		// res = await db.get(doc0._id);
		// console.log(res);


		// doc0["_rev"] = res._rev;
		// doc0.content = "test content revised doc0";
		// res = await db.insert(doc0);
		// console.log(res);
		// console.log(`Revised doc to db ${res}`);


		// console.log("Get doc from db after revision");
		// res = await db.get(doc0._id);
		// console.log(res);

	} catch(err) {
		console.error(`Error => ${err}`);
	}
}













// Handle Login
app.get("/appid/login", passport.authenticate(WebAppStrategy.STRATEGY_NAME, {
	successRedirect: "/code30",
	forceLogin: true
}));

app.get("/appid/callback", passport.authenticate(WebAppStrategy.STRATEGY_NAME, {
	successRedirect: "/code30",
	forceLogin: true
}));

app.get("/appid/logout", (req, res) => {
	WebAppStrategy.logout(req);
	res.redirect("/");
});


const userSnips = [];

app.get("/code30", (req, res) => {
	res.render("../public/views/pages/code30", {
		snipContent: userSnips
	});
});

app.post("/code30", (req, res) => {

	snipTitle = req.body.snipTitle;
	snipInput = req.body.snipInput;

	const post = {
		title: req.body.snipTitle,
		content: req.body.snipInput
	}

	userSnips.pop(post);
	res.redirect("/code30");

});

app.get("/newsnippet", (req, res) => {
	res.render("../public/views/pages/newsnippet");
});

app.post("/newsnippet", (req, res) => {

	snipTitle = req.body.snipTitle;
	snipInput = req.body.snipInput;

	const post = {
		title: req.body.snipTitle,
		content: req.body.snipInput,
	}

	userSnips.push(post);

	res.redirect("/code30");
});


app.get("/index", passport.authenticate(WebAppStrategy.STRATEGY_NAME, {
	successRedirect: "/code30",
	forceLogin: true,
	failureRedirect: "https://code30.mybluemix.net/appid/login",
	failureFlash : true // allow flash messages
}));

app.get("/", (req, res) => {
	res.render("../public/views/pages/index");
});




app.post("/index", bodyParser.urlencoded({extended: false}), passport.authenticate(WebAppStrategy.STRATEGY_NAME, {
	successRedirect: "/code30",
	failureRedirect: "https://code30.mybluemix.net/appid/login",
	forceLogin: true,
	failureFlash : true // allow flash messages
 }));

// Callback to finish the authorization process. Will retrieve access and identity tokens/
// from AppID service and redirect to either (in below order)
// 1. the original URL of the request that triggered authentication, as persisted in HTTP session under WebAppStrategy.ORIGINAL_URL key.
// 2. successRedirect as specified in passport.authenticate(name, {successRedirect: "...."}) invocation
// 3. application root ("/")

// Protect the whole app
// app.use(passport.authenticate(WebAppStrategy.STRATEGY_NAME));

app.use("/api", (req,res,next) => {
	if (req.user) {
		next();
	} else {
		res.status(401).send("Unauthorized");
	}
});

app.get("/api/user", (req, res) => {
	res.json({
		user: {
			name: req.user.name
		}
	});
});

// This will statically serve pages:
app.use(express.static("./public"));

app.get("/resources", (req, res) => {
	res.render("../public/views/pages/resources");
  });



app.listen(port, () => {
	console.log("Listening on http://localhost:" + port);
});
