import React, { createContext, useEffect } from "react";
import "./Location.css";
import Map from "./Map.js";
import { useState } from "react";
import axios from "axios";
// import polyline from 'polyline'
import { encode } from "@googlemaps/polyline-codec";

const mapData = createContext();
function Location() {
  const [source, setSource] = useState(null);
  const [destination, setDestination] = useState(null);
  const [vehicle, setVehicle] = useState("2AxlesAuto");
  const [cash, setCash] = useState(null);
  const [distance, setDistance] = useState();
  const [fuel, setFuel] = useState("");
  const [tempData, setTempData] = useState("");
  const [strtCoordinates, setStrtCoordinates] = useState("");
  const [endCoordinates, setEndCoordinates] = useState("");
  const [tolls, setTolls] = useState("");

  const [showFuelInputs, setShowFuelInputs] = useState(false);
  const [cityFuel, setCityFuel] = useState("");
  const [highwayFuel, setHighwayFuel] = useState("");
  const [fuelPrice, setFuelPrice] = useState(104);

  const handleFuelInfoButtonClick = () => {
    setShowFuelInputs(!showFuelInputs);
  };

  const Toll_GURU_KEY = process.env.REACT_APP_TOLL_GURU_API_KEY;
  const BING_MAP_API_KEY = process.env.REACT_APP_BING_MAP_API_KEY;

  const bingMapsUrl = `http://dev.virtualearth.net/REST/v1/Routes?wayPoint.1=${source}&waypoint.2=${destination}&routeAttributes=routepath&key=${BING_MAP_API_KEY}`;
  const tollguruUrl =
    "http://localhost:3001/tollguru/toll/v2/complete-polyline-from-mapping-service";

  const fetchData = async () => {
    console.log("vehicel", vehicle);

    // if(source !== null && destination !== null ){
    if (source === null || destination === null) {
      alert("Please fill in all required fields");
      return;
    } else {
      try {
        console.log(
          "City:",
          cityFuel,
          "Highway",
          highwayFuel,
          "Fuel:",
          fuelPrice
        );
        // Fetch data from Bing Maps Maps API using Axios
        const bingMapsResponse = await axios.get(bingMapsUrl);

        const data = bingMapsResponse.data;
        console.log("Bing Maps Data", data);
        setStrtCoordinates(
          data.resourceSets[0].resources[0].routeLegs[0].actualStart.coordinates
        );
        setEndCoordinates(
          data.resourceSets[0].resources[0].routeLegs[0].actualEnd.coordinates
        );

        // Extract polyline coordinates from the response
        const temp =
          data.resourceSets[0].resources[0].routePath.line.coordinates;
        setTempData(temp);

        // console.log(temp.map(points => ({lat:points[0], lng:points[1]})));
        console.log("Bing Maps Coordinates", temp);

        // Encode polyline
        // const bingMapsPolyline = polyline.encode(temp);
        const bingMapsPolyline = encode(temp, 5);

        if (!bingMapsPolyline) {
          throw new Error("No polyline data found");
        }
        // console.log('Bing Maps Polyline', JSON.stringify(bingMapsPolyline));

        const datas = {
          mapProvider: "bing",
          polyline: bingMapsPolyline,
          vehicle: {
            type: vehicle,
          },
          fuelOptions: {
            fuelCost: {
              value: fuelPrice,
              units: "INR/Liter",
              currency: "INR",
              fuelUnit: "Liter",
            },
            fuelEfficiency: { city: cityFuel, hwy: highwayFuel, units: "Km/L" },
          },
          units: { currency: "INR" },
        };
        const tollguruResponse = await axios.post(tollguruUrl, datas, {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": Toll_GURU_KEY,
          },
        });
        const tollguruData = tollguruResponse.data;
        console.log("Toll Guru Data", tollguruData);
        console.log(
          "Tolls Data from",
          source,
          "to",
          destination,
          ": ",
          "Cash:",
          tollguruData.route.costs.cash
        );

        setCash(tollguruData.route.costs.cash);
        setDistance(tollguruData.route.distance.metric);
        setFuel(tollguruData.route.costs.fuel);
        setTolls(tollguruData.route.tolls);
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const vehicleData = (e) => {
    setVehicle(e.target.value);
  };

  useEffect(() => {
    // console.log('vehicle', vehicle);
    switch (vehicle) {
      case "2AxlesAuto":
        setCityFuel(14);
        setHighwayFuel(18);
        break;
      case "2AxlesTaxi":
        setCityFuel(12);
        setHighwayFuel(15);
        break;
      case "2AxlesMotorcycle":
        setCityFuel(35);
        setHighwayFuel(45);
        break;
      case "2AxlesLCV":
        setCityFuel(7.3);
        setHighwayFuel(9.1);
        break;
      case "2AxlesTruck":
        setCityFuel(5);
        setHighwayFuel(6);
        break;
      case "2AxlesBus":
        setCityFuel(3);
        setHighwayFuel(3.8);
        break;
      default:
        setCityFuel(0);
        setHighwayFuel(0);
    }
  }, [vehicle]);

  const wholeData = {
    strtCoordinates,
    endCoordinates,
    tempData,
    tolls,
  };
  return (
    <mapData.Provider value={wholeData}>
      <div className="lcn">
        <div className="container">
          <Map></Map>
        </div>
        <div className="onTop">
          {/* <form> */}
          <input
            type="text"
            placeholder="Enter Starting Location"
            onChange={(e) => setSource(e.target.value)}
            required
          ></input>
          <input
            type="text"
            placeholder="Enter Destination"
            onChange={(e) => setDestination(e.target.value)}
            required
          ></input>
          <button onClick={fetchData}>Check</button>
          <br />
          {/* </form> */}
          <b>
            <span style={{ color: "black" }}>Select your vehicle</span>
          </b>
          <select style={{ borderRadius: "20px" }} onChange={vehicleData}>
            <option value={"2AxlesAuto"}>Car / van / Jeep / SUV</option>
            <option value={"2AxlesTaxi"}>Taxi</option>
            <option value={"2AxlesMotorcycle"}>Bike</option>
            <option value={"2AxlesLCV"}>
              Pickup Truck, Light Commercial Vehicle
            </option>
            <option value={"2AxlesTruck"}>Truck</option>
            <option value={"2AxlesBus"}>Bus</option>
          </select>

          {/* Fuel Info Button */}
          <button onClick={handleFuelInfoButtonClick}>Fuel Information</button>

          {/* Fuel Input Fields */}
          {showFuelInputs && (
            <>
              <br />
              <label for="city">City Milage:</label>
              <input
                type="number"
                id="City"
                value={cityFuel}
                onChange={(e) => setCityFuel(e.target.value)}
              />
              <br />
              <label for="Highway">Highway Milage:</label>
              <input
                type="number"
                id="Highway"
                value={highwayFuel}
                onChange={(e) => setHighwayFuel(e.target.value)}
              />
              <br />
              <label for="Fuel">Fuel Price:</label>
              <input
                type="number"
                id="Fuel"
                value={fuelPrice}
                onChange={(e) => setFuelPrice(e.target.value)}
              />
            </>
          )}

          {tempData && (
            <div>
              <b>Total Toll (cash) :</b> {cash}
            </div>
          )}
          {tempData && (
            <div>
              <b>Distance:</b> {distance}
            </div>
          )}
          {tempData && (
            <div>
              <b>Fuel Cost:</b> {fuel}
            </div>
          )}
        </div>
      </div>
    </mapData.Provider>
  );
}

export default Location;
export { mapData };
