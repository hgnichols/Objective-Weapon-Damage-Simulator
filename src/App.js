import React, { Component } from 'react';
import { MDBTooltip } from 'mdbreact';
import 'react-rangeslider/lib/index.css'
import Slider from 'react-rangeslider'
import { Button } from 'react-bootstrap'

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
      <MDBTooltip
        placement="bottom"
        componentClass="btn btn-secondary inlineBlock p-0 m-2 choice"
        component="button"
        tooltipContent={props.choice.rarity !== undefined ? (props.choice.rarity + " " + props.choice.name) : props.choice.name}>
        <img className="choiceImage" src={ props.getImageById(props.choice._id) } alt={"Choice " + props.choice.name} 
        onClick={() => {
          props.setFunction(props.choiceType, props.choice);
        }} />
      </MDBTooltip>    
    </div>
  );
};

const CalculatedInfo = (props) => { 
	return (
  	<div className="inlineBlock p-1 m-3 border border-secondary">
      {props.text}:{' '}
      {!isNaN(props.value) && props.value != null && props.value !== undefined && props.value !== "" && "value" in props ? props.value : ""}{' '}
      {props.unit}
    </div>
  );
};

const InfoHeader = (props) => {
  return(
    <div className="mt-1">
      Weapon: {typeof props.weapon.name === "string" ? props.weapon.rarity: ""} {typeof props.weapon.name === "string" ? props.weapon.name: ""} <br/>
      Talents: {props.talents} <br/>
      Runes: {props.runes}
      <br/>
      <Button className="btn btn-dark" onClick={props.resetFunction}>Reset</Button>
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
    headShotPercentSliderValue: 0,
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
  };

  setSelectedTalents = (talents) => {
    this.setState({selectedTalents: talents});
  };

  setSelectedRunes = (runes) => {
    this.setState({selectedRunes: runes});
  };

  copyOfArrayAfterRemove = (toRemove, array) => {
    var copy = array;
    var index = copy.indexOf(toRemove);
    if(index > -1) {
      copy.splice(index, 1);
    }
    return copy;
  }

  setSelectedChoice = (choiceType, choice) => {
    switch(choiceType) {
      case "Weapons":
      if(this.state.selectedWeapon !== undefined && this.state.selectedWeapon === choice) {
        this.setSelectedWeapon([]);
      } else {
        this.setSelectedWeapon(choice);
      }
        break;
      case "Talents":
      if(this.state.selectedTalents !== undefined && this.state.selectedTalents.includes(choice)) {
        this.setSelectedTalents(this.copyOfArrayAfterRemove(choice, this.state.selectedTalents));
      } else {
        this.setSelectedTalents(this.state.selectedTalents.concat(choice));
      }
        break;
      case "Runes":
      if(this.state.selectedRunes !== undefined && this.state.selectedRunes.includes(choice)) {
        this.setSelectedRunes(this.copyOfArrayAfterRemove(choice, this.state.selectedRunes));
      } else {
        this.setSelectedRunes(this.state.selectedRunes.concat(choice));
      }
        break;
      default:
        //do nothing
    }
  };

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

  calculateDPS = (weapon, talents, runes, headShotChance) => {
    return this.calculateDPM(weapon, talents, runes, headShotChance)/60;
  };

  //WHY THE FUCK DO I HAVE TO MAKE THIS IN HEAR AND OUTSIDE?Q!?!?!?!?
  handleModifier = (modifierName, damage, modifierValue, weapon, headShotChance) => {
    var calculatedDamage;

    switch(modifierName) {
      case "percent":
        calculatedDamage = damage + (damage * modifierValue);
        break;
      case "headshotPercent":
      if(weapon.canHeadshot) {
        calculatedDamage = damage + Math.abs(((weapon.fireRate * 60) + (((weapon.fireRate * 60) * (headShotChance/100)) * (weapon.damage * (0.5 + modifierValue)))) - ((weapon.fireRate * 60) + (((weapon.fireRate * 60) * headShotChance/100) * (weapon.damage * 0.5))));
      } else {
        calculatedDamage = damage;
      }
        break;
      default:
      calculatedDamage = damage;
    }

    return calculatedDamage;
  };

  calculateDPM = (weapon, talents, runes, headShotChance) => {
    //((Dm * RPM ) + ((RPM * CC) * (Dmg * CD))/60
    //WHY THE FUCK DO I HAVE TO MAKE THIS IN HEAR AND OUTSIDE?Q!?!?!?!?
    var handleModifier = (modifierName, damage, modifierValue) => {
      var calculatedDamage;
  
      switch(modifierName) {
        case "percent":
          calculatedDamage = damage + (damage * modifierValue);
          break;
        case "headshotPercent":
        if(weapon.canHeadshot) {
          calculatedDamage = damage + Math.abs(((weapon.fireRate * 60) + (((weapon.fireRate * 60) * (headShotChance/100)) * (weapon.damage * (0.5 + modifierValue)))) - ((weapon.fireRate * 60) + (((weapon.fireRate * 60) * headShotChance/100) * (weapon.damage * 0.5))));
        } else {
          calculatedDamage = damage;
        }
          break;
        default:
        calculatedDamage = damage;
      }
  
      return calculatedDamage;
    };

    var damage;
    if(weapon.canHeadshot) {
      damage = (weapon.damage * (weapon.fireRate * 60)) + (((weapon.fireRate * 60) * headShotChance/100) * (weapon.damage * 0.5)) + weapon.extraDamage;
    } else {
      damage = (weapon.damage * (weapon.fireRate * 60));
    }
     

    talents.forEach(function(t) {
      damage = handleModifier(t.modifierType, damage, t.damageModifier);
    });

    runes.forEach(function(r) {
      damage = handleModifier(r.modifierType, damage, r.damageModifier);
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

  handleHeadShotPercentSliderOnChange = (value) => {
    this.setState({
      headShotPercentSliderValue: value
    })
  }

  calculateHeadshotDamage = (selectedWeapon, selectedTalents, selectedRunes) => {
    if(!selectedWeapon.canHeadshot) {
      //probably actually need to make this say NA on the thing
      return "NA";
    }

    var headshotDamageIncrease = 0.5;

    selectedTalents.forEach(function(t) {
      if(t.modifierType === "headshotPercent") {
        headshotDamageIncrease += t.damageModifier;
      }
    });

    selectedRunes.forEach(function(t) {
      if(t.modifierType === "headshotPercent") {
        headshotDamageIncrease += t.damageModifier;
      }
    });

    var damage = selectedWeapon.damage + selectedWeapon.damage * headshotDamageIncrease;

    return damage;
  }

  resetChoices = () => {
    this.setState({selectedWeapon: [], selectedRunes: [], selectedTalents: []});
  }

  render() {
    const { choiceColumnInfo, dataToLoadName, selectedWeapon, selectedRunes, selectedTalents, headShotPercentSliderValue } = this.state;
    const calculatedInfoInitialState = [<CalculatedInfo text={"DPS"} value={this.calculateDPS(selectedWeapon, selectedTalents, selectedRunes, headShotPercentSliderValue)} unit={""}/>,
                                        <CalculatedInfo text={"Damage Per Minute"} value={this.calculateDPM(selectedWeapon, selectedTalents, selectedRunes, headShotPercentSliderValue)} unit={""}/>,
                                        <CalculatedInfo text={"Damage Per Shot"} value={selectedWeapon.damage} unit={""}/>,
                                        <CalculatedInfo text={"Headshot Damage"} value={this.calculateHeadshotDamage(selectedWeapon, selectedTalents, selectedRunes)} unit={""}/>,
                                        <CalculatedInfo text={"Fire Rate"} value={selectedWeapon.fireRate} unit={""}/>]; 

    return (
      <div className="container">
        <br/>
        <h3 className="mx-auto" style={{width: 478 + 'px'}}>Objective Weapon Damage Simulator</h3>
        <br/>
        <div className="row border border-secondary">
          <div className="col slider">
          <div align="center">
            Head Shot Chance
          </div>
          <Slider
            value={headShotPercentSliderValue}
            min={0}
            max={100}
            step={1}
            orientation="horizontal"
            onChange={this.handleHeadShotPercentSliderOnChange}
          />
          <div className='value' align="center">{headShotPercentSliderValue}</div>
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
        <div className="container p-0">
          <div className="row mainContentRow">
            <ChoiceContainerColumn title={choiceColumnInfo.title} options={this.getDataByName(dataToLoadName).map(dat => (
              <Choice choice={dat} choiceType={choiceColumnInfo.title} setFunction={this.setSelectedChoice} getImageById={this.getImageById} />
            ))} buttonLeftTitle={choiceColumnInfo.leftButtonTitle} buttonRightTitle={choiceColumnInfo.rightButtonTitle} choiceButtonClicked={this.choiceButtonClicked}/>           
            <div className="col border border-secondary">
              <InfoHeader weapon={selectedWeapon} talents={this.createSelecteableListAsString(selectedTalents)} runes={this.createSelecteableListAsString(selectedRunes)} resetFunction={this.resetChoices}/>
              {calculatedInfoInitialState}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
