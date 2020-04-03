/* eslint-disable */
import React, { useEffect, useState } from "react";
import Card from "react-bootstrap/Card";
import CardColumns from "react-bootstrap/CardColumns";
import Clients from "./Clients";
import QHNavBar from "../shared/NavBar";
import teamLogo from "../images/group-24px.svg";
import PredictPcgFTEWithExpRatio from "./PredictPcgFTEWithExpRatio";
import PredictPsrFTEWithExpRatio from "./PredictPsrFTEWithExpRatio";
import DropdownButton from "./DropdownButton";
import { DragDropContext } from "react-beautiful-dnd";
import { clientLevelWork } from "./ClientActivity";
import { Container, Row, Col, CardGroup, CardDeck, Button } from "react-bootstrap";
import { Spinner } from "react-bootstrap";
import NewPcgExp from "./NewPcgExp";
import NewPsrExp from "./NewPsrExp";
import TextField from "@material-ui/core/TextField";

//Declare variable for new POD
const exp = new Map();     //expRatios
const clt = new Map();     //clients
const cltpsr = new Map();  //clientPSR
const psrw = new Map();    //psrWorks
const pcgw = new Map();    //pcgworks
const podmmb = new Map();  //podMemMap
const cltmmb = new Map();  //memMap
let init = true;
let show = false;
let displayed = 0;
let check = false;
const pcgfte = new Map();
const psrfte = new Map();


function Workloads() {
  //clientPSR * pod -- remains constant
  const [expRatios, setExpRatios] = useState();
  const [workloads, setWorkloads] = useState();
  const [clients, setClients] = useState();
  const [clientPSR, setClientPSR] = useState();
  const [configs, setConfigs] = useState();
  const [psrWorks, setPsrWorks] = useState();
  const [activities, setActivities] = useState();
  const [capacity, setCapacity] = useState();
  const [members, setMembers] = useState();
  const [allPredictFTE, setAllPredictFTE] = useState(0);
  const [allInputFTE, setAllInputFTE] = useState(0);

  const [workloadLoading, setWorkloadLoading] = useState(true);
  const [expRatioLoading, setExpRatioLoading] = useState(true);
  const [clientsConfigLoading, setClientsConfigLoading] = useState(true);
  const [psrLoading, setPSRLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [clientPSRLoading, setClientPSRLoading] = useState(true);
  const [currentConfigsLoading, setCurrentConfigLoading] = useState(true);
  const [memberLoading, setMemberLoading] = useState(true);

  //info for FTEs
  const MonthCap1 = 0.76;
  const MonthCap2 = 0.83;
  const MonthCap3 = 0.88;
  const MonthCap4 = 0.9;
  const MonthCap5 = 0.92;
  const MonthCap6 = 0.96;
  const FTE_per_month = (capacity || 1570) / 12;

  const memMap = new Map(); //key is GroupId and value is members
  const podMemMap = new Map(); //key is podId and value is pod's total members

  const cardsRefsMap = {};

  const cards = Array(24).fill("Loading...");

  const apiHost = "https://qhpredictiveapi.com:8000";

  // const apiHost = "http://127.0.0.1:5000";

  function setAllLoading(status) {
    setWorkloadLoading(status);
    setActivityLoading(status);
    setClientsConfigLoading(status);
    setExpRatioLoading(status);
    setPSRLoading(status);
    setClientPSRLoading(status);
    setCurrentConfigLoading(status);
    setMemberLoading(status);
  }

  const fetchWorkload = async () => {
    try {
      setAllLoading(true);

      fetch(apiHost + "/workload")
        .then(response => response.json())
        .then(workload => {
          setWorkloads(workload);
          setWorkloadLoading(false);
        })
        .catch(error => {
          throw new Error(error.toString());
        });

      fetch(apiHost + "/fetch_data")
        .then(response => response.json())
        .then(expRatios => {
          setExpRatios(expRatios);
          setExpRatioLoading(false);
        })
        .catch(error => {
          throw new Error(error.toString());
        });

      fetch(apiHost + "/client_psr")
        .then(response => response.json())
        .then(config => {
          setClientPSR(config);
          setClientPSRLoading(false);
        })
        .catch(error => {
          throw new Error(error.toString());
        });

      fetch(apiHost + "/pod_to_clients")
        .then(response => response.json())
        .then(config => {
          setClients(config);
          setClientsConfigLoading(false);
        })
        .catch(error => {
          throw new Error(error.toString());
        });

      fetch(apiHost + "/activity")
        .then(response => response.json())
        .then(activity => {
          setActivities(activity);
          setActivityLoading(false);
        })
        .catch(error => {
          throw new Error(error.toString());
        });

      fetch(apiHost + "/current_configs")
        .then(response => response.json())
        .then(current_configs => {
          setConfigs(current_configs);
          setCurrentConfigLoading(false);
        })
        .catch(error => {
          throw new Error(error.toString());
        });

      fetch(apiHost + "/psr")
        .then(response => response.json())
        .then(psr => {
          setPsrWorks(psr);
          setPSRLoading(false);
        })
        .catch(error => {
          throw new Error(error.toString());
        });
      fetch(apiHost + "/members")
        .then(response => response.json())
        .then(member => {
          setMembers(member);
          setMemberLoading(false);
        })
        .catch(error => {
          throw new Error(error.toString());
        });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchWorkload();
  }, []);

  const changeAllTimeHours = (
    sourceDroppable,
    destDroppable,
    draggableId,
    isPsr,
    lbl
  ) => {
    let sourcePod = document.getElementById(lbl + sourceDroppable).innerText;
    let destinationPod = document.getElementById(lbl + destDroppable).innerText;
    let text = "PCG All Time Hours: ";
    let hours_source = Number(sourcePod.slice(20, sourcePod.length));
    let hours_dest = Number(destinationPod.slice(20, destinationPod.length));

    let sourceTotal = clientLevelWork[draggableId][7];
    if (isPsr) {
      text = "PSR All Time Hours: "
      sourceTotal = (clientPSR[draggableId][0] * 7.68) / 60;
    }
    hours_source -= sourceTotal;
    if (hours_source <= 0.1) {
      hours_source = 0.0;
    }
    hours_dest += sourceTotal;

    //reset values
    document.getElementById(lbl + sourceDroppable).innerText =
      text + hours_source.toFixed(2).toString();
    document.getElementById(lbl + destDroppable).innerText =
      text + hours_dest.toFixed(2).toString();
  };

  const changeFte = (
    sourceDroppable,
    destDroppable,
    isPsr,
    srcLbl,
    destLbl
  ) => {
    let sourcePod = document.getElementById("total_pcg_" + sourceDroppable)
      .innerText;
    let destPod = document.getElementById("total_pcg_" + destDroppable)
      .innerText;
    if (isPsr) {
      //change formula
      sourcePod = document.getElementById("total_psr_" + sourceDroppable)
        .innerText;
      destPod = document.getElementById("total_psr_" + destDroppable).innerText;
    }

    let source = sourcePod.slice(20, sourcePod.length);
    let dest = destPod.slice(20, destPod.length);
    let sourceFte;
    let destFte;
    if (sourceDroppable in expRatios) {
      sourceFte = (
        source /
        FTE_per_month /
        (12 +
          expRatios[sourceDroppable].EXP_RATIO *
          (MonthCap1 +
            MonthCap2 +
            MonthCap3 +
            MonthCap4 +
            MonthCap5 +
            MonthCap6 -
            6))
      )
        .toFixed(2)
        .toString();
    } else {  //source is new pod
      sourceFte = (
        source /
        FTE_per_month /
        (12 +
          (exp.get(parseInt(sourceDroppable))).EXP_RATIO *
          (MonthCap1 +
            MonthCap2 +
            MonthCap3 +
            MonthCap4 +
            MonthCap5 +
            MonthCap6 -
            6))
      )
        .toFixed(2)
        .toString();
    }
    if (destDroppable in expRatios) {
      destFte = (
        dest /
        FTE_per_month /
        (12 +
          expRatios[destDroppable].EXP_RATIO *
          (MonthCap1 +
            MonthCap2 +
            MonthCap3 +
            MonthCap4 +
            MonthCap5 +
            MonthCap6 -
            6))
      )
        .toFixed(2)
        .toString();
    } else {  // destination is new pod
      destFte = (
        dest /
        FTE_per_month /
        (12 +
          (exp.get(parseInt(destDroppable))).EXP_RATIO *
          (MonthCap1 +
            MonthCap2 +
            MonthCap3 +
            MonthCap4 +
            MonthCap5 +
            MonthCap6 -
            6))
      )
        .toFixed(2)
        .toString();
    }
    document.getElementById(srcLbl).innerText = "Predicted FTEs: " + sourceFte;
    document.getElementById(destLbl).innerText = "Predicted FTEs: " + destFte;
  };

  const changeMembNum = (sourceDroppable, destDroppable, draggableId) => {
    let clientMembers = memMap.get(draggableId);
    let sourcePod =
      Number(
        document
          .getElementById("podMembNum" + sourceDroppable)
          .innerText.slice(15)
      ) - clientMembers;
    let destPod =
      Number(
        document
          .getElementById("podMembNum" + destDroppable)
          .innerText.slice(15)
      ) + clientMembers;

    if (exp.has(parseInt(sourceDroppable))) {
      cltmmb.set(draggableId, sourcePod)
      let temp = podmmb.get(parseInt(sourceDroppable)) - clientMembers;
      podmmb.set(parseInt(sourceDroppable), temp);
    }
    if (exp.has(parseInt(destDroppable))) {
      cltmmb.set(draggableId, destPod)
      let temp = podmmb.get(parseInt(destDroppable)) + clientMembers;
      podmmb.set(parseInt(destDroppable), temp);
    }
    document.getElementById("podMembNum" + sourceDroppable).innerText =
      "Total Members: " + sourcePod.toString();
    document.getElementById("podMembNum" + destDroppable).innerText =
      "Total Members: " + destPod.toString();
  };

  //source/dest - indexing into workloads, draggableId - client dragged
  const changeDropDown = (sourceDroppable, destDroppable, draggableId) => {
    //pcg
    if (!(sourceDroppable in workloads)) {  //source is new pod
      let id = parseInt(sourceDroppable);
      pcgw.get(id).PCGPDC_TIME_HOURS -= clientLevelWork[draggableId][0];
      pcgw.get(id).PCGPAC_TIME_HOURS -= clientLevelWork[draggableId][1];
      pcgw.get(id).PCGFLLUP_TIME_HOURS -= clientLevelWork[draggableId][2];
      pcgw.get(id).PCGNEWALERT_TIME_HOURS -= clientLevelWork[draggableId][3];
      pcgw.get(id).PCGREF_TIME_HOURS -= clientLevelWork[draggableId][4];
      pcgw.get(id).PCGTERM_TIME_HOURS -= clientLevelWork[draggableId][5];
      pcgw.get(id).PCGEMPGRP_TIME_HOURS -= clientLevelWork[draggableId][6];

      pcgw.get(id).PCG_ALL_TIME_HOURS =
        pcgw.get(id).PCGPDC_TIME_HOURS +
        pcgw.get(id).PCGPAC_TIME_HOURS +
        pcgw.get(id).PCGFLLUP_TIME_HOURS +
        pcgw.get(id).PCGNEWALERT_TIME_HOURS +
        pcgw.get(id).PCGREF_TIME_HOURS +
        pcgw.get(id).PCGTERM_TIME_HOURS +
        pcgw.get(id).PCGEMPGRP_TIME_HOURS;
    } else {
      workloads[sourceDroppable].PCGPDC_TIME_HOURS -=
        clientLevelWork[draggableId][0];
      workloads[sourceDroppable].PCGPAC_TIME_HOURS -=
        clientLevelWork[draggableId][1];
      workloads[sourceDroppable].PCGFLLUP_TIME_HOURS -=
        clientLevelWork[draggableId][2];
      workloads[sourceDroppable].PCGNEWALERT_TIME_HOURS -=
        clientLevelWork[draggableId][3];
      workloads[sourceDroppable].PCGREF_TIME_HOURS -=
        clientLevelWork[draggableId][4];
      workloads[sourceDroppable].PCGTERM_TIME_HOURS -=
        clientLevelWork[draggableId][5];
      workloads[sourceDroppable].PCGEMPGRP_TIME_HOURS -=
        clientLevelWork[draggableId][6];
    }
    if (!(destDroppable in workloads)) {  //destination is new pod
      let id = parseInt(destDroppable);
      pcgw.get(id).PCGPDC_TIME_HOURS += clientLevelWork[draggableId][0];
      pcgw.get(id).PCGPAC_TIME_HOURS += clientLevelWork[draggableId][1];
      pcgw.get(id).PCGFLLUP_TIME_HOURS += clientLevelWork[draggableId][2];
      pcgw.get(id).PCGNEWALERT_TIME_HOURS += clientLevelWork[draggableId][3];
      pcgw.get(id).PCGREF_TIME_HOURS += clientLevelWork[draggableId][4];
      pcgw.get(id).PCGTERM_TIME_HOURS += clientLevelWork[draggableId][5];
      pcgw.get(id).PCGEMPGRP_TIME_HOURS += clientLevelWork[draggableId][6];

      pcgw.get(id).PCG_ALL_TIME_HOURS =
        pcgw.get(id).PCGPDC_TIME_HOURS +
        pcgw.get(id).PCGPAC_TIME_HOURS +
        pcgw.get(id).PCGFLLUP_TIME_HOURS +
        pcgw.get(id).PCGNEWALERT_TIME_HOURS +
        pcgw.get(id).PCGREF_TIME_HOURS +
        pcgw.get(id).PCGTERM_TIME_HOURS +
        pcgw.get(id).PCGEMPGRP_TIME_HOURS;
    } else {
      workloads[destDroppable].PCGPDC_TIME_HOURS +=
        clientLevelWork[draggableId][0];
      workloads[destDroppable].PCGPAC_TIME_HOURS +=
        clientLevelWork[draggableId][1];
      workloads[destDroppable].PCGFLLUP_TIME_HOURS +=
        clientLevelWork[draggableId][2];
      workloads[destDroppable].PCGNEWALERT_TIME_HOURS +=
        clientLevelWork[draggableId][3];
      workloads[destDroppable].PCGREF_TIME_HOURS +=
        clientLevelWork[draggableId][4];
      workloads[destDroppable].PCGTERM_TIME_HOURS +=
        clientLevelWork[draggableId][5];
      workloads[destDroppable].PCGEMPGRP_TIME_HOURS +=
        clientLevelWork[draggableId][6];
    }

    //psr
    if (!(sourceDroppable in psrWorks)) {
      psrw.get(parseInt(sourceDroppable)).PERC_TOTAL_PSR_PHONE -= clientPSR[draggableId][1];
      psrw.get(parseInt(sourceDroppable)).PRED_PHONE_VOLUME -= clientPSR[draggableId][0];
    } else {
      psrWorks[sourceDroppable].PERC_TOTAL_PSR_PHONE -= clientPSR[draggableId][1];
    }
    if (!(destDroppable in psrWorks)) {
      psrw.get(parseInt(destDroppable)).PERC_TOTAL_PSR_PHONE += (clientPSR[draggableId][1]);
      psrw.get(parseInt(destDroppable)).PRED_PHONE_VOLUME += clientPSR[draggableId][0];
    } else {
      psrWorks[destDroppable].PERC_TOTAL_PSR_PHONE += clientPSR[draggableId][1];
    }
  };

  const onDragEnd = result => {
    const { destination, source, draggableId } = result;
    if (!destination) {
      return;
    }
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    let st;
    let fh;
    let inSrc = false;
    let inDest = false;

    // check if source and destination in new pod
    if (parseInt(source.droppableId) in clients) {
      st = clients[parseInt(source.droppableId)];
    } else {
      st = clt.get(parseInt(source.droppableId));
      inSrc = true;
    }
    if (parseInt(destination.droppableId) in clients) {
      fh = clients[parseInt(destination.droppableId)];
    } else {
      fh = clt.get(parseInt(destination.droppableId));
      inDest = true;
    }
    const start = st;
    const finish = fh;

    if (start === finish) {
      //replica of the pod's clients
      const newClients = Array.from(start);
      let removed = newClients.splice(source.index, 1);
      //replace with removed element instead
      newClients.splice(destination.index, 0, removed[0]);
      //replace
      clients[parseInt(source.droppableId)] = newClients;
      setClients(JSON.parse(JSON.stringify(clients)));
      return;
    }
    //update labels - is there a more elegant way?
    changeDropDown(
      Number(source.droppableId)
        .toFixed(1)
        .toString(),
      Number(destination.droppableId)
        .toFixed(1)
        .toString(),
      draggableId
    );
    changeAllTimeHours(
      source.droppableId,
      destination.droppableId,
      draggableId,
      false,
      "total_pcg_"
    );
    changeAllTimeHours(
      source.droppableId,
      destination.droppableId,
      draggableId,
      true,
      "total_psr_"
    );
    changeFte(
      source.droppableId,
      destination.droppableId,
      false,
      "pod" + source.droppableId + "PcgFte",
      "pod" + destination.droppableId + "PcgFte"
    );
    changeFte(
      source.droppableId,
      destination.droppableId,
      true,
      "pod" + source.droppableId + "PsrFte",
      "pod" + destination.droppableId + "PsrFte"
    );
    changeMembNum(source.droppableId, destination.droppableId, draggableId);

    //save state when client is dragged across pods============================
    const startPod = Array.from(start);
    let removed = startPod.splice(source.index, 1);
    const finishPod = Array.from(finish);
    finishPod.splice(destination.index, 0, removed[0]);

    if (!inSrc) {
      clients[parseInt(source.droppableId)] = startPod;
    } else {
      clt.set(parseInt(source.droppableId), startPod);
    }
    if (!inDest) {
      clients[parseInt(destination.droppableId)] = finishPod;
    } else {
      clt.set(parseInt(destination.droppableId), finishPod);
    }
    setClients(JSON.parse(JSON.stringify(clients)));
  };

  const initializeCards = () => {
    return cards.map((card, index) => {
      return (
        <Card key={index} className="p-3" container={"container-sm"}>
          <Card.Body>
            <Spinner animation={"border"} size={"sm"} variant={"warning"}
              style={{ marginRight: "0.5rem" }} />
            {card}
          </Card.Body>
        </Card>
      );
    });
  };

  const table = [];

  const updateCards = () => {
    const ratioChangeHandler = (isPcgRatio, index, changedRatio) => {
      if (isPcgRatio) {
        expRatios[index].EXP_RATIO = changedRatio;
      } else {
        expRatios[index].PSR_EXP_RATIO = changedRatio;
      }
    };

    // Fetch activities
    activities.map(activity => (
      <div>
        {table.push([
          activity.INITIAL_POD,
          activity.Group_Name,
          activity.GroupID,
          activity.Month,
          activity.PCGPDC_TIME_HOURS_SUCC,
          activity.PCGPDC_TIME_HOURS_UNSUCC,
          activity.PCGPAC_TIME_HOURS_SUCC,
          activity.PCGPAC_TIME_HOURS_UNSUCC,
          activity.PCGFLLUP_TIME_HOURS_SUCC,
          activity.PCGFLLUP_TIME_HOURS_UNSUCC,
          activity.PCGNEWALERT_TIME_HOURS_SUCC,
          activity.PCGNEWALERT_TIME_HOURS_UNSUCC,
          activity.PCGREF_TIME_HOURS_SUCC,
          activity.PCGREF_TIME_HOURS_UNSUCC,
          activity.PCGTERM_TIME_HOURS_SUCC,
          activity.PCGTERM_TIME_HOURS_UNSUCC,
          activity.PCGEMPGRP_TIME_HOURS_SUCC,
          activity.PCGEMPGRP_TIME_HOURS_UNSUCC
        ])}
      </div>
    ));

    // Extract number of members and store in the map

    Object.keys(members).map(key => {
      let clients = members[key];
      Object.keys(clients).map(key1 => {
        if (key1 === "Total") {
          podMemMap.set(key, clients[key1]);
        } else {
          memMap.set(key1, clients[key1]);
        }
      });
    });

    return Object.keys(workloads).map(key => {
      let pcgWk = workloads[key];
      let psrWK = psrWorks[key];
      let podMem = 0;
      if (podMemMap.has(parseInt(key).toString())) {
        podMem = podMemMap.get(parseInt(key).toString());
      }
      cardsRefsMap[parseInt(key)] = React.createRef();

      return (
        <Card
          key={key}
          className="p-3 pod-card"
          container="container-sm"
          ref={cardsRefsMap[parseInt(key)]}
        >
          <Card.Img variant="top" />
          <Card.Title>
            <img
              alt={"team_icon"}
              src={teamLogo}
              style={{ marginRight: "0.5rem" }}
              className="d-inline-block align-top"
            />
            POD {parseInt(key)}
            <span
              id={"podMembNum" + parseInt(key)}
              className={"float-right"}
              style={{ fontSize: "15px" }}
            >
              Total Members: {podMem}
            </span>
          </Card.Title>

          {/* Predicted PCG FTE with its experience ratio */}
          <PredictPcgFTEWithExpRatio
            index={parseInt(key)}
            initExperienceRatio={expRatios[parseInt(key)].EXP_RATIO}
            ratioChangeHandler={ratioChangeHandler}
            isPcgRatio={true}
            capacity={capacity}
            allInputFTE={allInputFTE}
            updateTotalInputFTE={setAllInputFTE}
            allPredictFTE={allPredictFTE}
            updateTotalPredictFTE={setAllPredictFTE}
            pcgTime={
              document.getElementById("total_pcg_" + parseInt(key)) &&
              document.getElementById("total_pcg_" + parseInt(key)).innerText
            }
          />

          {/* Predicted PSR FTE with its experience ratio */}
          <PredictPsrFTEWithExpRatio
            index={parseInt(key)}
            initExperienceRatio={expRatios[parseInt(key)].PSR_EXP_RATIO}
            ratioChangeHandler={ratioChangeHandler}
            isPcgRatio={false}
            capacity={capacity}
            allInputFTE={allInputFTE}
            updateTotalInputFTE={setAllInputFTE}
            allPredictFTE={allPredictFTE}
            updateTotalPredictFTE={setAllPredictFTE}
            psrTime={
              document.getElementById("total_psr_" + parseInt(key)) &&
              document.getElementById("total_psr_" + parseInt(key)).innerText
            }
          />

          {/* Dropdown buttons for both PCG and PSR */}
          <DropdownButton
            pcgWK={pcgWk}
            psrWK={psrWK}
            pod_key={key}
            gpsOfClients={table}
          />

          {/* List the POD's clients */}
          <Clients
            clientsPerPOD={clients[parseInt(key)]}
            podId={parseInt(key)}
            gpsOfClients={table}
            clientMem={memMap}
          />
        </Card>
      );
    });
  };

  // Create new POD
  const [add, setAdd] = useState(""); //numbers of new pod
  const [submit, setSubmit] = useState("");

  const handleSubmit = (evt) => {
    evt.preventDefault();
    if (parseInt(submit) > 10) {
      alert("Maximum number of new POD is 10")
    } else if (submit === "") {
      alert("Please enter a number")
    } else if (submit === add) {
      alert("There are already " + submit + " new POD")
    } else {
      init = true;
      setAdd(submit);
      show = true;
      //if user reset # of new pod, re-fetch data
      displayed > 0 ? (
        fetchWorkload(), setAllInputFTE(0), setAllPredictFTE(0)
      ) : displayed = 1;
    }
  }

  const handleChange = (evt) => {
    let temp = evt.target.value.replace(/\D/, '');
    setSubmit(temp)
  }

  const InitNewPodValue = props => {
    if (init || typeof props === 'undefined') {
      let ct = add;
      let len = cards.length;
      const result = [];
      for (let i = 1; i <= parseInt(ct); i++) {
        result[result.length] = len + i;
      }
      for (let i of result) {
        exp.set(i, { EXP_RATIO: 0.2, PSR_EXP_RATIO: 0.2 });
        clt.set(i, [[0, ""]]);
        cltpsr.set(i, [0, 0]);
        pcgw.set(i, {
          PCGEMPGRP_TIME_HOURS: 0,
          PCGFLLUP_TIME_HOURS: 0,
          PCGNEWALERT_TIME_HOURS: 0,
          PCGPAC_TIME_HOURS: 0,
          PCGPDC_TIME_HOURS: 0,
          PCGREF_TIME_HOURS: 0,
          PCGTERM_TIME_HOURS: 0,
          PCG_ALL_TIME_HOURS: 0
        });
        psrw.set(i, {
          PERC_TOTAL_PSR_PHONE: 0,
          PRED_PHONE_VOLUME: 0,
          SUCC_TIME_PSR_PHONE: 0
        })
        podmmb.set(i, 0);
        pcgfte.set(i, 0);
        psrfte.set(i, 0);
      }
      init = false;
      check = true;
    }

    return (<>{show && <DisplayPod count={add} />}</>)
  }


  const DisplayPod = props => {
    console.log("DisplayPod")
    const ratioChangeHandler = (isPcgRatio, index, changedRatio) => {
      if (isPcgRatio) {
        (exp.get(index)).EXP_RATIO = changedRatio;
      } else {
        (exp.get(index)).PSR_EXP_RATIO = changedRatio;
      }
    };

    let len = cards.length;
    const result = [];
    for (let i = 1; i <= parseInt(props.count); i++) {
      result[result.length] = len + i;
    }

    const res = result.map((key) =>
      <Card
        key={key}
        className="p-3 pod-card"
        container="container-sm"
      >
        <Card.Img variant="top" />
        <Card.Title>
          <img
            alt={"team_icon"}
            src={teamLogo}
            style={{ marginRight: "0.5rem" }}
            className="d-inline-block align-top"
          />POD {key}
          <span
            id={"podMembNum" + parseInt(key)}
            className={"float-right"}
            style={{ fontSize: "15px" }}
          >Total Members: {podmmb.get(key)}
          </span>
        </Card.Title>

        {/* Predicted PCG FTE with its experience ratio */}
        <NewPcgExp
          index={parseInt(key)}
          initExperienceRatio={(exp.get(key)).EXP_RATIO}
          ratioChangeHandler={ratioChangeHandler}
          isPcgRatio={true}
          capacity={capacity}
          allInputFTE={allInputFTE}
          updateTotalInputFTE={setAllInputFTE}
          allPredictFTE={allPredictFTE}
          updateTotalPredictFTE={setAllPredictFTE}
          pcgTime={
            document.getElementById("total_pcg_" + parseInt(key)) &&
            document.getElementById("total_pcg_" + parseInt(key)).innerText
          }
          // isnew={check}
          pcgfte={pcgfte}
        />

        {/* Predicted PSR FTE with its experience ratio */}
        <NewPsrExp
          index={parseInt(key)}
          initExperienceRatio={(exp.get(key)).PSR_EXP_RATIO}
          ratioChangeHandler={ratioChangeHandler}
          isPcgRatio={false}
          capacity={capacity}
          allInputFTE={allInputFTE}
          updateTotalInputFTE={setAllInputFTE}
          allPredictFTE={allPredictFTE}
          updateTotalPredictFTE={setAllPredictFTE}
          psrTime={
            document.getElementById("total_psr_" + parseInt(key)) &&
            document.getElementById("total_psr_" + parseInt(key)).innerText
          }
          // isnew={check}
          psrfte={psrfte}
        />

        {/* Dropdown buttons for both PCG and PSR */}
        <DropdownButton
          pcgWK={pcgw.get(parseInt(key))}
          psrWK={psrw.get(parseInt(key))}
          pod_key={key}
          gpsOfClients={table}
        />

        {/* List the POD's clients */}
        <Clients
          clientsPerPOD={clt.get(parseInt(key))}
          podId={parseInt(key)}
          gpsOfClients={table}
          clientMem={memMap}
        />
      </Card>
    )
    check = false;
    return (
      <>
        {/* <CardColumns>{res}</CardColumns> */}
        <div>{res}</div>
      </>
    )
  }

  const addPOD = () => {
    return (
      <Card
        className="p-3 pod-card"
        container="container-sm"
        style={{ marginTop: "15px" }}>
        <p>Number of new POD (Max. 10):</p>
        <TextField
          label="What if I add... "
          type="text"
          pattern="[0-9]*"
          value={submit}
          onChange={handleChange} />
        <Button
          onClick={handleSubmit}
          style={{ marginBottom: "30px", marginTop: "30px" }}>
          Submit
          </Button>
        {show && <InitNewPodValue value={add} />}
      </Card>
    );
  }

  return workloadLoading ||
    expRatioLoading ||
    clientsConfigLoading ||
    psrLoading ||
    activityLoading ||
    currentConfigsLoading ||
    memberLoading ||
    clientPSRLoading ? (
      <div>
        <QHNavBar
          loading={
            workloadLoading ||
            expRatioLoading ||
            clientsConfigLoading ||
            psrLoading ||
            activityLoading ||
            currentConfigsLoading ||
            memberLoading ||
            clientPSRLoading
          }
          cardsRefsMap={cardsRefsMap}
        />
        <div>
          <CardColumns style={{ margin: "15px 15px" }}>{initializeCards()}</CardColumns>
        </div>
      </div>
    ) : (
      <div>
        <QHNavBar
          loading={
            workloadLoading ||
            expRatioLoading ||
            clientsConfigLoading ||
            psrLoading ||
            activityLoading ||
            currentConfigsLoading ||
            memberLoading ||
            clientPSRLoading
          }
          clientsConfig={clients}
          updateConfig={setClients}
          currentConfigs={configs}
          setIsLoading={setAllLoading}
          updateWorkloads={setWorkloads}
          expRatios={expRatios}
          updateExpRatios={setExpRatios}
          updateConfigsList={setConfigs}
          updatePSRWork={setPsrWorks}
          updateActivities={setActivities}
          updateCapacity={setCapacity}
          updateMembers={setMembers}
          cardsRefsMap={cardsRefsMap}
          allInputFTE={allInputFTE}
          setAllInputFTE={setAllInputFTE}
          allPredictFTE={allPredictFTE}
          setAllPredictFTE={setAllPredictFTE}
          initNewPod={InitNewPodValue}
        />
        <DragDropContext onDragEnd={onDragEnd}>
          <div>
            <Container fluid>
              {/* For development use */}
              <Row>
                <Col md="3">{addPOD()}</Col>
                <Col><CardColumns style={{ margin: "15px 15px" }}>{updateCards()}</CardColumns></Col>
              </Row>

              {/* <Row>
                <CardColumns style={{ margin: "15px 15px" }}>{updateCards()}</CardColumns>
              </Row>
              <Row style={{ marginBottom: "2em" }}>{addPOD()}</Row> */}
            </Container>
          </div>
        </DragDropContext>
      </div>
    );
}
export default Workloads;
