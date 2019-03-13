import React, { Component } from 'react';
import './App.css';

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
      <button type="button" className="btn btn-outline-primary inlineBlock p-1 m-3 choice">
        {props.choice.icon}
        <br/>
        {props.choice.name}
      </button>    
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
    selectedWeapon: []
  };

  // when component mounts, first thing it does is fetch all existing data in our db
  // then we incorporate a polling logic so that we can easily see if our db has 
  // changed and implement those changes into our UI
  componentDidMount() {
    this.getWeaponDataFromDb();
    this.getTalentDataFromDb();
    this.getRuneDataFromDb();
  };

  // never let a process live forever 
  // always kill a process everytime we are done using it
  // componentWillUnmount() {
  //   if (this.state.intervalIsSet) {
  //     clearInterval(this.state.intervalIsSet);
  //     this.setState({ intervalIsSet: null });
  //   }
  // }

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
  // just a note, here, in the front end, we use the id key of our data object 
  // in order to identify which we want to Update or delete.
  // for our back end, we use the object id assigned by MongoDB to modify 
  // data base entries

  // our first get method that uses our backend api to 
  // fetch data from our data base
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

  calculateDPS = (weapon) => {
    return ((weapon.damage*weapon.fireRate)/60) + weapon.extraDamage;
  };

  render() {
    const { choiceColumnInfo, dataToLoadName, selectedWeapon } = this.state;
    const calculatedInfoInitialState = [<CalculatedInfo text={"DPS"} value={this.calculateDPS(selectedWeapon)} unit={""}/>]; 

    return (
      <div className="container">
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
        <div className="row mainContentRow">
          <ChoiceContainerColumn title={choiceColumnInfo.title} options={this.getDataByName(dataToLoadName).map(dat => (
            <Choice choice={dat} />
          ))} buttonLeftTitle={choiceColumnInfo.leftButtonTitle} buttonRightTitle={choiceColumnInfo.rightButtonTitle} choiceButtonClicked={this.choiceButtonClicked}/>           
          <div className="col border border-secondary">
            <InfoHeader weapon={"Slug Rifle"} talents={"headshot damage"} runes={"head shot damage"}/>
            {calculatedInfoInitialState}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
