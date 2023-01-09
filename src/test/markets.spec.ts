import { expect } from "chai";
import utils from "../utils";

describe("making market id tests", () => {
  it("should return correctly formatted id for given date", () => {
    const result = utils.markets.makeMarketId(
      new Date("2021-01-01"),
      "ASC",
      "1"
    );
    expect(result).to.equal("018628ASC01");

    const resultTwo = utils.markets.makeMarketId(
      new Date("2022-12-08 23:00:00"),
      "DBN",
      "1"
    );
    expect(resultTwo).to.equal("019334DBN01");

    const resultThree = utils.markets.makeMarketId(
      new Date("2022-12-09 1:00:00"),
      "DBN",
      "1"
    );
    expect(resultThree).to.equal("019335DBN01");
  });
});