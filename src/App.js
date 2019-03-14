import React, { Component } from 'react';
import './App.css';
import ReactTooltip from 'react-tooltip'
import { MDBTooltip } from 'mdbreact';
const WeaponSchema = require("./backend/WeaponSchema");

class App extends Component {
  render() {
    return (
      <div className="App">
        <WeaponDamageCalculator/>
      </div>
    );
  }
}

const ChoiceContainerColumn = (props) => { 
	return (
  	<div className="col-3 border border-primary">
      <div className="row justify-content-center">
        <div className="mt-1 mb-0">
          {props.title}
        </div>
      </div>     
      <div className="row justify-content-center">
        {/*Add organization shit for props array*/}
        {props.options}
      </div>     
      <ChoiceContainerButtonRow leftTitle={props.buttonLeftTitle} rightTitle={props.buttonRightTitle} choiceButtonClicked={props.choiceButtonClicked}/>
    </div>
  );
};

const ChoiceContainerButtonRow = (props) => {
  return (
    <div className="row align-items-end">
      <div className="col text-center">
        <p className="m-0">
          {props.leftTitle}
        </p>
        <button className="m-1" onClick={() => props.choiceButtonClicked(props.leftTitle)}>Lefty</button>
      </div>
      <div className="col text-center">
        <p className="m-0">
          {props.rightTitle}
        </p>
        <button className="m-1" onClick={() => props.choiceButtonClicked(props.rightTitle)}>Right</button>
      </div>
    </div>
  );
};

const Choice = (props) => { 
	return (
  	<div>
      {/*make this look good*/}
      <MDBTooltip
        placement="bottom"
        componentClass="btn btn-secondary inlineBlock p-0 m-2 choice"
        tag="div"
        component="button"
        tooltipContent={props.choice.name}>
        <img className="choiceImage" src={ props.getImageById(props.choice._id) } alt={"Choice " + props.choice.name} 
        onClick={() => {
          switch(props.choiceType) {
            case "Weapons":
            props.weaponSetFunction(props.choice);
              break;
            case "Talents":
              props.talentSetFunction(props.choice);
              break;
            case "Runes":
              // code block
              break;
            default:
              //do nothing
          }
        }} />
      </MDBTooltip>    
    </div>
  );
};

const CalculatedInfo = (props) => { 
	return (
  	<div className="inlineBlock p-1 m-3 border border-secondary">
      {props.text}:{' '}
      {props.value}{' '}
      {props.unit}
    </div>
  );
};

const InfoHeader = (props) => {
  return(
    <div className="mt-1">
      Ordered List of Choices: {props.weapon}{', '} {props.talents}{', '}{props.runes}
    </div>
  )
}

class WeaponDamageCalculator extends React.Component {

  state = {
    weaponData: [],
    runeData: [],
    talentData: [],
    /*The left and right buttons will be gotten from the database*/
    orderedChoiceButtonTitles: ["Weapons", "Talents", "Runes"],
    choiceColumnInfo: {title: "Weapons", collection: "WeaponData", leftButtonTitle: "Runes", rightButtonTitle: "Talents"},
    dataToLoadName: "Weapons",
    selectedWeapon: [],
    selectedRunes: [],
    selectedTalents: [],
  };

  componentDidMount() {
    this.getWeaponDataFromDb();
    this.getTalentDataFromDb();
    this.getRuneDataFromDb();
  };

  getLeftAndRightButtonTitleForChoiceColumn = (titleOfButtonClicked) => {
    this.setState({ dataToLoadName: titleOfButtonClicked });
    var index = this.state.orderedChoiceButtonTitles.indexOf(titleOfButtonClicked);
    var nextIndex;
    var prevIndex;
    if(index === 0) {
      nextIndex = 1;
      prevIndex = this.state.orderedChoiceButtonTitles.length -1;
    } else if(index === this.state.orderedChoiceButtonTitles.length - 1) {
      nextIndex = 0;
      prevIndex = this.state.orderedChoiceButtonTitles.length - 2;
    } else {
      nextIndex = index + 1;
      prevIndex = index - 1;
    };
    
    return {left: this.state.orderedChoiceButtonTitles[prevIndex], right: this.state.orderedChoiceButtonTitles[nextIndex]}
  }

  getWeaponDataFromDb = () => {
    fetch("http://localhost:3001/api/getWeaponData")
      .then(data => data.json())
      .then(res => this.setState({ weaponData: res.data }));
  };

  getTalentDataFromDb = () => {
    fetch("http://localhost:3001/api/getTalentData")
      .then(data => data.json())
      .then(res => this.setState({ talentData: res.data }));
  };

  getRuneDataFromDb = () => {
    fetch("http://localhost:3001/api/getRuneData")
      .then(data => data.json())
      .then(res => this.setState({ runeData: res.data }));
  };

  choiceButtonClicked = (titleClicked) => {
    this.setState(prevState => ({choiceColumnInfo: {title: titleClicked, 
                                                    collection: prevState.choiceColumnInfo.collection, 
                                                    leftButtonTitle: this.getLeftAndRightButtonTitleForChoiceColumn(titleClicked).left, 
                                                    rightButtonTitle: this.getLeftAndRightButtonTitleForChoiceColumn(titleClicked).right}}));
  };

  setSelectedWeapon = (weapon) => {
    this.setState({selectedWeapon: weapon});
  }

  setSelectedTalent = (talent) => {
    this.setState({selectedTalents: [talent]});
  }

  getDataByName = (name) => {
    let dataToReturn;
    var names = this.state.orderedChoiceButtonTitles;
    switch(name) {
      case names[0]:
        dataToReturn = this.state.weaponData;
        break;
      case names[1]:
        dataToReturn = this.state.talentData;
        break;
      case names[2]:
        dataToReturn = this.state.runeData;
        break;
      default:
      dataToReturn = [];
  }

    return dataToReturn;
  };

  calculateDPS = (weapon, talents) => {
    var handleModifier = (modifierName, damage, modifierValue) => {
      var calculatedDamage;
  
      switch(modifierName) {
        case "percent":
          calculatedDamage = damage + (damage * modifierValue);
          break;
        case "headshotPercent":
        calculatedDamage = damage;
          break;
        default:
        calculatedDamage = damage;
      }
  
      return calculatedDamage;
    }

    var damage = (weapon.damage*weapon.fireRate) + weapon.extraDamage;
    talents.forEach(function(talent) {
      damage = handleModifier(talent.modifierType, damage, talent.damageModifier);
    });

    return damage;
  };

  getImageById = (id) => {
    var path = '.\\images\\' + id + '.png';
    return path;
  };

  createSelecteableListAsString = (selecteableList) => {
    var text = [];
    if(selecteableList === undefined) {return "";}
    selecteableList.forEach(function(talent) {
      text.push(talent.name);
    });

    return text.join();
  }

  render() {
    const { choiceColumnInfo, dataToLoadName, selectedWeapon, selectedRunes, selectedTalents } = this.state;
    const calculatedInfoInitialState = [<CalculatedInfo text={"DPS"} value={this.calculateDPS(selectedWeapon, selectedTalents)} unit={""}/>]; 

    return (
      <div className="container">
      <ReactTooltip />
        <br/>
        <h3 className="mx-auto" style={{width: 478 + 'px'}}>Objective Weapon Damage Simulator</h3>
        <br/>
        <div className="row border border-secondary">
          <div className="col" align="center">
            {/*slider 1*/}
            Slider 1
          </div>
          <div className="col border border-secondary" align="center">
            {/*slider 2*/}
            Slider 2
          </div>
          <div className="col border border-secondary" align="center">
            {/*slider 3*/}
            Slider 3
          </div>
        </div>
        <div className="container">
          <div className="row mainContentRow">
            <ChoiceContainerColumn title={choiceColumnInfo.title} options={this.getDataByName(dataToLoadName).map(dat => (
              <Choice choice={dat} choiceType={choiceColumnInfo.title} weaponSetFunction={this.setSelectedWeapon} talentSetFunction={this.setSelectedTalent} getImageById={this.getImageById} />
            ))} buttonLeftTitle={choiceColumnInfo.leftButtonTitle} buttonRightTitle={choiceColumnInfo.rightButtonTitle} choiceButtonClicked={this.choiceButtonClicked}/>           
            <div className="col border border-secondary">
              <InfoHeader weapon={selectedWeapon.name} talents={this.createSelecteableListAsString(selectedTalents)} runes={""}/>
              {calculatedInfoInitialState}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
