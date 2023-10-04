const mqtt = require("mqtt");
const fs = require("fs");
require("dotenv").config();

const protocol = process.env.PROTOCOL;
const host = process.env.HOST;
const port = process.env.PORT;
const path = "/mqtt";

const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;
const connectUrl = `${protocol}://${host}:${port}`;

const client = mqtt.connect(connectUrl, {
  clientId,
  clean: true,
  connectTimeout: 4000,
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
  reconnectPeriod: 1000,
  ca: fs.readFileSync("./emqxsl-ca.crt"),
});

const topic = "/nodejs/mqtt";
const payload = "nodejs mqtt test";
const qos = 0;

// https://github.com/mqttjs/MQTT.js#event-connect
client.on("connect", () => {
  console.log(`🛜 ${protocol}: Connected`);

  // https://github.com/mqttjs/MQTT.js#mqttclientsubscribetopictopic-arraytopic-object-options-callback
  client.subscribe(topic, { qos }, (error: any) => {
    if (error) {
      console.log("❌ subscribe error:", error);
      return;
    }
    console.log(`🛜 ${protocol}: Subscribe to topic '${topic}'`);

    // https://github.com/mqttjs/MQTT.js#mqttclientpublishtopic-message-options-callback
    client.publish(topic, payload, { qos }, (error: any) => {
      if (error) {
        console.error(error);
      }
    });
  });
});

// https://github.com/mqttjs/MQTT.js#event-reconnect
client.on("reconnect", (error: any) => {
  console.log(`⚠️ Reconnecting(${protocol}):`, error);
});

// https://github.com/mqttjs/MQTT.js#event-error
client.on("error", (error: any) => {
  console.log(`❌ Cannot connect(${protocol}):`, error);
});

// https://github.com/mqttjs/MQTT.js#event-message
client.on("message", (topic: string, payload: any) => {
  console.log("✅ Received Message:", topic, payload.toString());
});
