import React from "react";
import DropdownItem from "react-bootstrap/DropdownItem";
import Dropdown from "react-bootstrap/Dropdown";
import GraphForPCG from "./GraphForPCG";
import GraphForMonthPCG from "./GraphForMonthPCG";

function DropdownButton(props) {
    const pcg = props.pcgWK;
    const psr=props.psrWK;
    const gpsOfClients=props.gpsOfClients;
    const podId=props.podId;
    const PCGActy = [];
    const PCGcmp = ["PDC Time", "PAC Time", "Follow Up Time", "New Alert Time",
        "Reference Time", "Term Time", "EMPGRP"];

    let dropdownButtonStyle = {
        width: "100%",
        marginBottom: "1rem",
        backgroundColor: "#84BD00",
        border: "0px"
        };

    return (
        <>
        {/* Dropdown button for PCG */}
        <Dropdown>
            <Dropdown.Toggle
                id="total_time_dropdown"
                style={dropdownButtonStyle}
            >
                {"PCG All Time Hours: " + parseInt(pcg.PCG_ALL_TIME_HOURS).toFixed(2)}
            </Dropdown.Toggle>
            <Dropdown.Menu style={{ width: "100%" }}>
                <DropdownItem>
                    <b>More Information: </b>
                </DropdownItem>
                <DropdownItem>
                    PDC Time: {PCGActy[PCGActy.length] = pcg.PCGPDC_TIME_HOURS.toFixed(2)}
                </DropdownItem>
                <DropdownItem>
                    PAC Time: {PCGActy[PCGActy.length] = pcg.PCGPAC_TIME_HOURS.toFixed(2)}
                </DropdownItem>
                <DropdownItem>
                    Follow Up Time: {PCGActy[PCGActy.length] = pcg.PCGFLLUP_TIME_HOURS.toFixed(2)}
                </DropdownItem>
                <DropdownItem>
                    New Alert Time:{" "}
                    {PCGActy[PCGActy.length] = pcg.PCGNEWALERT_TIME_HOURS.toFixed(2)}
                </DropdownItem>
                <DropdownItem>
                    Reference Time: {PCGActy[PCGActy.length] = pcg.PCGREF_TIME_HOURS.toFixed(2)}
                </DropdownItem>
                <DropdownItem>
                    Term Time: {PCGActy[PCGActy.length] = pcg.PCGTERM_TIME_HOURS.toFixed(2)}
                </DropdownItem>
                <DropdownItem>
                    EMPGRP Time: {PCGActy[PCGActy.length] = pcg.PCGEMPGRP_TIME_HOURS.toFixed(2)}
                </DropdownItem>
                <DropdownItem>
                    <GraphForPCG cmp={PCGcmp} data={PCGActy} podId={podId}/>
                </DropdownItem>
                <DropdownItem>
                    <GraphForMonthPCG gpsOfClients={gpsOfClients} podId={podId}/>
                </DropdownItem>
            </Dropdown.Menu>
        </Dropdown>

        {/* Dropdown button for PSR  */}
        <Dropdown>
        <Dropdown.Toggle
          id="total_time_dropdown"
          style={dropdownButtonStyle}
        >
          {"PSR All Time Hours: " +
            (psr.PRED_PHONE_VOLUME * 7.68 / 60).toFixed(2)}
        </Dropdown.Toggle>
        <Dropdown.Menu style={{ width: "100%" }}>
          <DropdownItem>
            <b>More Information: </b>
          </DropdownItem>
          <DropdownItem>
            Percentage of predicted total PSR phone calls:
            {" " + psr.PERC_TOTAL_PSR_PHONE.toFixed(2) * 100 + "%"}
          </DropdownItem>
          <DropdownItem>
            PSR Act-Like Members: {psr.PSR_PHONE_ACTS_LIKE_MEM.toFixed(2)}
          </DropdownItem>
        </Dropdown.Menu>
      </Dropdown>
      </>
    )
}

export default DropdownButton;