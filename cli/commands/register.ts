import * as command from "./commands";
import axios from "axios";
import { headers, url } from "./constant";

Object.keys(command).map((e) => {
  axios
    //@ts-ignore
    .post(url, JSON.stringify(command[e]), {
      headers: headers,
    })
    .then((e) => {
      console.log(e.status, e.data);
    });
});
