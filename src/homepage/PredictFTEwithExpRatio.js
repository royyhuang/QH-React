import React, { useEffect, useState } from "react";
import Slider from "@material-ui/core/Slider";

import './PredictFTEwithExpRatio.css';

const marks = [
  {
    value: 0,
    label: "Experienced"
  },
  {
    value: 100,
    label: "New"
  }
];

const PredictFTEwithExpRatio = props => {
  const { index, pcgTime, initExperienceRatio, ratioChangeHandler } = props;
  const MonthCap1 = 0.76;
  const MonthCap2 = 0.83;
  const MonthCap3 = 0.88;
  const MonthCap4 = 0.9;
  const MonthCap5 = 0.92;
  const MonthCap6 = 0.96;
  const [predictedFTE, setPredictedFTE] = useState();
  const [ratio, setRatio] = useState(initExperienceRatio);
  const FTE_per_month = 1570 / 12;

  useEffect(() => {
    /**
     * From month 1 to 6,
     * Sum of [(exp_ratio)*(predictedFTE)*(FTE_per_month)*(MonthCap)
     *             + (1-exp_ratio)*(predictedFTE)*(FTE_per_month)] = pcgTime
     *
     * After 6 months,
     * Sum of (FTE_per_month * predictedFTE) = pcgTime
     *
     */
    const predictedFTE =
      pcgTime /
      FTE_per_month /
      (12 +
        ratio *
          (MonthCap1 +
            MonthCap2 +
            MonthCap3 +
            MonthCap4 +
            MonthCap5 +
            MonthCap6 -
            6));
    setPredictedFTE(predictedFTE);
  }, [pcgTime, ratio, FTE_per_month]);

  const formatValueText = value => {
    return `${value}%`;
  };

  const sliderHandler = (event, value) => {
    event.preventDefault();
    const changedRatio = value / 100;
    setRatio(changedRatio);
    ratioChangeHandler(index, changedRatio);
  };

  return (
    <>
      <p>Predicted FTEs: {predictedFTE && predictedFTE.toFixed(2)}</p>
        <Slider
          style={{ color: "#84BD00", marginBottom: "25px" }}
          defaultValue={parseInt(initExperienceRatio * 100)}
          onChangeCommitted={sliderHandler}
          min={0}
          step={1}
          max={100}
          marks={marks}
          valueLabelDisplay="auto"
          valueLabelFormat={formatValueText}
        />
    </>
  );
};

export default PredictFTEwithExpRatio;
