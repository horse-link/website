import axios from "axios";
import { SignedResponse } from "../types/index";

export default class Api {

  public getMeetings = async (): Promise<SignedResponse> => {
    const { data, status } = await axios.get<SignedResponse>(
      "http://localhost:3002/meetings",
      {
        headers: {
          Accept: "application/json"
        }
      }
    );

    return data;
  };
  // this.get<SignedResponse>(`https://api.horse.link/meetings`);
  // // this.get<SignedResponse>(`http://localhost:3000/meetings`);
}
