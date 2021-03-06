import React, { Component } from "react";
import { MDBTooltip } from "mdbreact";
import "react-rangeslider/lib/index.css";
import Slider from "react-rangeslider";
import { Button } from "react-bootstrap";
import { loadData } from "./DataHandler";

class App extends Component {
  render() {
    return (
      <div className="App">
        <WeaponDamageCalculator />
      </div>
    );
  }
}

function contentEditable(WrappedComponent) {
  return class extends React.Component {
    state = {
      editing: false
    };

    toggleEdit = e => {
      e.stopPropagation();
      //if you wanted to highlight all by double clicking it stopped editing leave commented out for now
      //if (this.state.editing) {
        //this.cancel();
      //} else {
        this.edit();
      //}
    };

    edit = () => {
      this.setState(
        {
          editing: true
        },
        () => {
          this.domElm.focus();
        }
      );
    };

    save = () => {
      this.setState(
        {
          editing: false
        },
        () => {
          if(this.props.validation(this.domElm.textContent)) {
            if (this.props.onSave && this.isValueChanged()) {
              this.props.onSave(this.domElm.textContent);
            };
          }         
        }
      );
    };

    cancel = () => {
      this.setState({
        editing: false
      });
    };

    isValueChanged = () => {
      return this.props.value !== this.domElm.textContent;
    };

    handleKeyDown = e => {
      const { key } = e;
      switch (key) {
        case "Enter":
        case "Escape":
          this.save();
          break;
      }
    };

    render() {
      let editOnClick = true;
      const { editing} = this.state;
      if (this.props.editOnClick !== undefined) {
        editOnClick = this.props.editOnClick;
      }
      return (
        <WrappedComponent
          className={editing ? "editing" : ""}
          onClick={editOnClick ? this.toggleEdit : undefined}
          contentEditable={editing}
          ref={domNode => {
            this.domElm = domNode;
          }}
          onBlur={this.save}
          onKeyDown={this.handleKeyDown}
          {...this.props}
        >
          {this.props.value}
        </WrappedComponent>
      );
    }
  };
}

const ChoiceContainerColumn = props => {
  return (
    <div className="col-3 border border-primary choiceContainerColumn">
      <div className="row justify-content-center testRow">
        <div className="mt-1 mb-0">{props.title}</div>
      </div>
      <div className="row testRow">
        {/*Add organization shit for props array*/}
        {props.options}
      </div>
      <ChoiceContainerButtonRow
        leftTitle={props.buttonLeftTitle}
        rightTitle={props.buttonRightTitle}
        choiceButtonClicked={props.choiceButtonClicked}
      />
    </div>
  );
};

const ChoiceContainerButtonRow = props => {
  return (
    <div>
      <div className="row align-items-end choiceConainerButtonRow">
        <div className="col text-center">
          <p className="m-0">{props.leftTitle}</p>
          <button
            className="m-1"
            onClick={() => props.choiceButtonClicked(props.leftTitle)}
          >
            Lefty
          </button>
        </div>
        <div className="col text-center">
          <p className="m-0">{props.rightTitle}</p>
          <button
            className="m-1"
            onClick={() => props.choiceButtonClicked(props.rightTitle)}
          >
            <div>Right</div>
          </button>
        </div>
      </div>
    </div>
  );
};

const Choice = props => {
  return (
    <div className="choice">
      <MDBTooltip
        placement="bottom"
        componentClass="btn btn-secondary inlineBlock p-0 m-2 choice"
        component="button"
        tooltipContent={
          props.choice.rarity !== undefined
            ? props.choice.rarity + " " + props.choice.name
            : props.choice.name
        }
      >
        <img
          className="choiceImage"
          src={props.getImageById(props.choice._id) }
          onError={(e)=>{e.target.onerror = null; e.target.src=".\\images\\ImageNotFound.png"}}
          alt={"Choice " + props.choice.name}
          onClick={() => {
            props.setFunction(props.choiceType, props.choice);
          }}
        />
      </MDBTooltip>
    </div>
  );
};

const CalculatedInfo = props => {
  return (
    <div className="inlineBlock p-1 m-3 border border-secondary">
      {props.text}:{" "}
      {!isNaN(props.value) &&
      props.value != null &&
      props.value !== undefined &&
      props.value !== "" &&
      "value" in props
        ? props.value
        : ""}{" "}
      {!isNaN(props.value) &&
      props.value !== null &&
      props.value !== undefined &&
      props.value !== "" &&
      "value" in props
        ? props.unit
        : ""}
    </div>
  );
};

const InfoHeader = props => {
  return (
    <div className="mt-1">
      <p>Abilities: {props.abilities}</p>
      Weapon: {typeof props.weapon.name === "string"
        ? props.weapon.rarity
        : ""}{" "}
      {typeof props.weapon.name === "string" ? props.weapon.name : ""} <br />
      Talents: {props.talents} <br />
      Runes: {props.runes}
      <br />
      <Button className="btn btn-dark" onClick={props.resetFunction}>
        Reset
      </Button>
    </div>
  );
};

const ClassSelecter = props => {
  return (
    <div className="m-0 p-0">
      {props.classes.map(dat => (
                <Button onClick={()=> {props.setFunction(dat)}} className={"p-1 m-1 btn " + props.setClassButtonColor(dat.name)}>{dat.name}</Button>
              ))}
      <p className="m-1">{props.selectedRealmClass !== undefined ? props.selectedRealmClass.name : ""}</p>
    </div>
  );
};

class WeaponDamageCalculator extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      weaponData: [],
      runeData: [],
      talentData: [],
      /*The left and right buttons will be gotten from the database*/
      orderedChoiceButtonTitles: ["Weapons", "Talents", "Runes", "Abilities"],
      choiceColumnInfo: {
        title: "Weapons",
        collection: "WeaponData",
        leftButtonTitle: "Abilities",
        rightButtonTitle: "Talents"
      },
      dataToLoadName: "Weapons",
      selectedWeapon: [],
      selectedRunes: [],
      selectedTalents: [],
      headShotPercentSliderValue: 20,
      totalEnemyHealth: 1500,
      classData: [],
      selectedClass: [],
      abilityData: [],
      selectedAbilities: [],
      chanceToHit: 50,
      };
    this.handleHeadShotPercentSliderOnChange = this.handleHeadShotPercentSliderOnChange.bind(this);
  }

  componentDidMount() {
    loadData().then(data => {
      console.log(data);
      this.loadRuneDataForClasses(data[3], data[1]);
      this.setState({ weaponData: data[0] });
      this.setState({ runeData: data[2] });
      this.setState({ talentData: data[1] });
    }).then(() =>  {
      if(this.getDataByName("Weapons").length > 0) {
        this.setSelectedWeapon(this.getDataByName("Weapons").find(element => (element.name == "Assault Rifle" && element.rarity == "Common")));
      };
    });
  }

  loadRuneDataForClasses = (classes, talents) => {
    var copyOfClasses = classes.slice();
    var x;
    var y;

    for (x = 0; x < copyOfClasses.length; x++) {
      for (y = 0; y < talents.length; y++) {
        if (copyOfClasses[x].name === talents[y].class) {
          copyOfClasses[x].availableRunes.push(talents[y]);
        }
      }
    }

    this.setState({ classData: copyOfClasses });
  };

  getLeftAndRightButtonTitleForChoiceColumn = titleOfButtonClicked => {
    this.setState({ dataToLoadName: titleOfButtonClicked });
    var index = this.state.orderedChoiceButtonTitles.indexOf(
      titleOfButtonClicked
    );
    var nextIndex;
    var prevIndex;
    if (index === 0) {
      nextIndex = 1;
      prevIndex = this.state.orderedChoiceButtonTitles.length - 1;
    } else if (index === this.state.orderedChoiceButtonTitles.length - 1) {
      nextIndex = 0;
      prevIndex = this.state.orderedChoiceButtonTitles.length - 2;
    } else {
      nextIndex = index + 1;
      prevIndex = index - 1;
    }

    return {
      left: this.state.orderedChoiceButtonTitles[prevIndex],
      right: this.state.orderedChoiceButtonTitles[nextIndex]
    };
  };

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

  getClassDataFromDb = () => {
    fetch("http://localhost:3001/api/getClassData")
      .then(data => data.json())
      .then(res => this.setState({ classData: res.data }));
  };

  choiceButtonClicked = titleClicked => {
    this.setState(prevState => ({
      choiceColumnInfo: {
        title: titleClicked,
        collection: prevState.choiceColumnInfo.collection,
        leftButtonTitle: this.getLeftAndRightButtonTitleForChoiceColumn(
          titleClicked
        ).left,
        rightButtonTitle: this.getLeftAndRightButtonTitleForChoiceColumn(
          titleClicked
        ).right
      }
    }));
  };

  setSelectedWeapon = weapon => {
    this.setState({ selectedWeapon: weapon });
  };

  setSelectedTalents = talents => {
    this.setState({ selectedTalents: talents });
  };

  setSelectedRunes = runes => {
    this.setState({ selectedRunes: runes });
  };

  setSelectedClass = classes => {
    if (
      this.state.selectedClass !== undefined &&
      this.state.selectedClass === classes
    ) {
      this.setState({selectedClass: []});
    } else {
      this.setState({ selectedClass: classes });
    };
  };

  copyOfArrayAfterRemove = (toRemove, array) => {
    var copy = array;
    var index = copy.indexOf(toRemove);
    if (index > -1) {
      copy.splice(index, 1);
    }
    return copy;
  };

  setSelectedChoice = (choiceType, choice) => {
    switch (choiceType) {
      case "Weapons":
        if (
          this.state.selectedWeapon !== undefined &&
          this.state.selectedWeapon === choice
        ) {
          this.setSelectedWeapon([]);
        } else {
          this.setSelectedWeapon(choice);
        }
        break;
      case "Talents":
        if (
          this.state.selectedTalents !== undefined &&
          this.state.selectedTalents.includes(choice)
        ) {
          this.setSelectedTalents(
            this.copyOfArrayAfterRemove(choice, this.state.selectedTalents)
          );
        } else {
          this.setSelectedTalents(this.state.selectedTalents.concat(choice));
        }
        break;
      case "Runes":
        if (
          this.state.selectedRunes !== undefined &&
          this.state.selectedRunes.includes(choice)
        ) {
          this.setSelectedRunes(
            this.copyOfArrayAfterRemove(choice, this.state.selectedRunes)
          );
        } else {
          this.setSelectedRunes(this.state.selectedRunes.concat(choice));
        }
        break;
      case "Classes":
        if (
          this.state.selectedWeapon !== undefined &&
          this.state.selectedWeapon === choice
        ) {
          this.setSelectedClass([]);
        } else {
          this.setSelectedClass(choice);
        }
        break;
      default:
      //do nothing
    }
  };

  getDataByName = name => {
    let dataToReturn;
    var names = this.state.orderedChoiceButtonTitles;
    switch (name) {
      case names[0]:
        dataToReturn = this.state.weaponData;
        break;
      case names[1]:
      if(this.state.selectedClass.availableRunes !== undefined) {
        dataToReturn = this.state.talentData.filter( ( el ) => this.state.selectedClass.availableRunes.includes( el ) );
      } else {
        dataToReturn = this.state.talentData;
      };
        break;
      case names[2]:
        dataToReturn = this.state.runeData;
        break;
      case names[3]:
        dataToReturn = this.state.abilityData;
        break;
      default:
        dataToReturn = [];
    }

    return dataToReturn;
  };

  calculateDPS = (weapon, talents, runes, headShotChance, hitChance) => {
    return this.calculateDPM(weapon, talents, runes, headShotChance, hitChance) / 60;
  };

  //((Dm * RPM ) + ((RPM * CC) * (Dmg * CD))/60
  handleModifier = (
    modifierName,
    damage,
    modifierValue,
    headShotChance,
    weapon
  ) => {
    var calculatedDamage;

    switch (modifierName) {
      case "percent":
        calculatedDamage = damage + weapon.damage * modifierValue;
        break;
      case "headshotPercentRune":
        if (weapon.canHeadshot) {
          //calculatedDamage = damage;
          calculatedDamage = damage + ((weapon.damage * (modifierValue * 0.5)) * (headShotChance/100));
        } else {
          calculatedDamage = damage;
        }
        break;
      case "headshotPercentTalent":
        if (weapon.canHeadshot) {
          //calculatedDamage = damage;
          calculatedDamage = damage + ((weapon.damage * modifierValue) * (headShotChance/100));
        } else {
          calculatedDamage = damage;
        }
        break;
      default:
        calculatedDamage = damage;
    }

    return calculatedDamage;
  };

  calculateDPM = (weapon, talents, runes, headShotChance, hitChance) => {
    var damage = weapon.damage;

    let modifierHandler = this.handleModifier;

    talents.forEach(function(t) {
      damage = modifierHandler(
        t.modifierType,
        damage,
        t.damageModifier,
        headShotChance,
        weapon,
      );
    });

    runes.forEach(function(r) {
      damage = modifierHandler(
        r.modifierType,
        damage,
        r.damageModifier,
        headShotChance,
        weapon,
      );
    });

    if (weapon.canHeadshot) {
      damage =
        //((weapon.fireRate * 60) - ((weapon.fireRate * 60) * (hitChance/100)))
        damage * Math.floor(((weapon.fireRate) * 60) * hitChance/100) +
        ((weapon.fireRate * 60 * headShotChance) / 100) *
          (weapon.damage * 0.5) +
        weapon.extraDamage;
    } else {
      damage = damage * (weapon.fireRate * 60);
    }

    return damage;
  };

  formatNumberByTwoDecimalPoints = (number) => {
    return parseFloat(Math.round(number * 100) / 100);
  };

  getImageById = id => {
    var path = ".\\images\\" + id + ".png";
    return path;
  };

  createSelecteableListAsString = selecteableList => {
    var text = [];
    if (selecteableList === undefined) {
      return "";
    }
    selecteableList.forEach(function(talent) {
      text.push(talent.name);
    });

    return text.join();
  };

  handleHeadShotPercentSliderOnChange = value => {
    this.setState({
      headShotPercentSliderValue: value
    });
  };

  handleTotalEnemyHealthSliderOnChange = value => {
    this.setState({
      totalEnemyHealth: value
    });
  };

  handleChanceToHitSliderOnChange = value => {
    this.setState({
      chanceToHit: value
    });
  };

  calculateHeadshotDamage = (
    selectedWeapon,
    selectedTalents,
    selectedRunes,
  ) => {
    var damage = selectedWeapon.damage + selectedWeapon.damage * 0.5;

    if (!selectedWeapon.canHeadshot) {
      //probably actually need to make this say NA on the thing
      //dosent because we parse NAN in the react element
      return "NA";
    }

    let modifierHandler = this.handleModifier;

    selectedTalents.forEach(function(t) {
      damage = modifierHandler(
        t.modifierType,
        damage,
        t.damageModifier,
        100,
        selectedWeapon
      );
    });

    selectedRunes.forEach(function(r) {
      damage = modifierHandler(
        r.modifierType,
        damage,
        r.damageModifier,
        100,
        selectedWeapon
      );
    });

    return damage;
  };

  calculateBaseDamageAfterModifiers = (
    selectedWeapon,
    selectedTalents,
    selectedRunes,
    headShotChance
  ) => {
    var damage = selectedWeapon.damage;

    if (!selectedWeapon.canHeadshot) {
      //probably actually need to make this say NA on the thing
      //dosent because we parse NAN in the react element
      return "NA";
    }

    let modifierHandler = this.handleModifier;

    selectedTalents.forEach(function(t) {
      if (!t.modifierType.includes("headshot")) {
        damage = modifierHandler(
          t.modifierType,
          damage,
          t.damageModifier,
          headShotChance,
          selectedWeapon
        );
      }
    });

    selectedRunes.forEach(function(r) {
      if (!r.modifierType.includes("headshot")) {
        damage = modifierHandler(
          r.modifierType,
          damage,
          r.damageModifier,
          headShotChance,
          selectedWeapon
        );
      }
    });

    return damage;
  };

  resetChoices = () => {
    this.setState({
      selectedWeapon: [],
      selectedRunes: [],
      selectedTalents: [],
      selectedClass: []
    });
  };

  calculateHeadShotsHitAndBodyShotsHit = (enemyTotalHealth, weaponDamage, chanceToHeadshotAsPercent, chanceToHitAsPercent) => {
    var headshotDamage = weaponDamage + weaponDamage * 0.5;
    //headshotChance Exists IRL as the number of shots hit that were headshots i.e headshotsHit/shotsHit = headshotChance
    //It can also be the number of headshots hit out of your total shots fired i.e headshotsHit/totalShotsFired = headshotChance
    var headshotChanceAsValue = chanceToHeadshotAsPercent / 100;
    var hitChanceAsValue = chanceToHitAsPercent / 100;

    var bodyShotsRequiredToKill = enemyTotalHealth / weaponDamage 
    var bodyshotsFiredIfAllBodyShots = Math.round(bodyShotsRequiredToKill * (1 + hitChanceAsValue)); //??Math.ceil(bodyShotsTakenToKill * (hitChance) or Math.floor(bodyShotsTakenToKill * (hitChance)??
    var headshotsHit = Math.ceil(bodyShotsRequiredToKill * headshotChanceAsValue);  //Could be floor or ceil should be opisite of body shot rounding
    var numberOfHeadshotsRequiredToIncreaseDamageDoneByAtLeastABodyShot = weaponDamage/(headshotDamage - weaponDamage)
    var lessBodyshotsBasedOnHeadshots = Math.floor(headshotsHit / numberOfHeadshotsRequiredToIncreaseDamageDoneByAtLeastABodyShot);
    var bodyshotsFired = (bodyshotsFiredIfAllBodyShots - headshotsHit) - lessBodyshotsBasedOnHeadshots;

    //might be neccissary one day
    var headshotDamageDone = headshotsHit * headshotDamage;
    var bodyshotDamageDone = (bodyShotsRequiredToKill - headshotsHit) * weaponDamage;
    var totalDamageDone = headshotDamageDone + bodyshotDamageDone;

    return  {bodyshots: bodyshotsFired, headshots: headshotsHit};  
  };

  calculateHeadShotsHitAndBodyShotsFiredToKillATarget = (enemyTotalHealth, weaponDamage, chanceToHeadshotAsPercent, chanceToHitAsPercent) => { 
    var headshotDamage = weaponDamage + weaponDamage * 0.5;
    //It can also be the number of headshots hit out of your total shots fired i.e headshotsHit/totalShotsFired = headshotChance
    var headshotChanceAsValue = chanceToHeadshotAsPercent / 100;
    var hitChanceAsValue = chanceToHitAsPercent / 100;

    var minimumNumberOfbodyShotsRequiredToKill = enemyTotalHealth / weaponDamage;
    var bodyshotsFiredIfAllBodyShots = (minimumNumberOfbodyShotsRequiredToKill / hitChanceAsValue); //??Math.ceil(bodyShotsTakenToKill * (hitChance) or Math.floor(bodyShotsTakenToKill * (hitChance)??
    var headshotsHit = bodyshotsFiredIfAllBodyShots * headshotChanceAsValue;  //Could be floor or ceil should be opisite of body shot rounding
    var numberOfHeadshotsRequiredToIncreaseDamageDoneByAtLeastABodyShot = weaponDamage/(headshotDamage - weaponDamage)
    var lessBodyshotsBasedOnHeadshots = headshotsHit / numberOfHeadshotsRequiredToIncreaseDamageDoneByAtLeastABodyShot;
    var bodyshotsFired = bodyshotsFiredIfAllBodyShots - headshotsHit - lessBodyshotsBasedOnHeadshots //need to calculate headshot increase;

    //might be neccissary one day
    var headshotDamageDone = headshotsHit * headshotDamage;
    var bodyshotDamageDone = (minimumNumberOfbodyShotsRequiredToKill - headshotsHit) * weaponDamage;
    var totalDamageDone = headshotDamageDone + bodyshotDamageDone;

    return  {bodyshots: bodyshotsFired, headshots: headshotsHit};  
  };

  calculateTTK = (enemyTotalHealth, selectedWeapon, headShotPercentSliderValue, chanceToHit) => {
    //* **All following info was for first try!*** */
    //ps dont count the first shot its a point 0 so its number of shots required to kill - 1 
    //numbers of = number of shots required to kill
    //Number shot required to kill = Cieling(Health&Armor / DamageAfterModifiers)
    /*(NormalRound(numberOfHeadShots * chanceToHit) * headShotDamage) + (NormalRound(numberOfBodyShots * chanceToHit) * bodyShotDamage) = 
        amount of damage done with headshot/bodyshot and chance to hit */

    /*
    1500 = AHeadshotDamageDone + BBodyshotDamageDone
    AHeadshotDamageDone = CNumberOfHeadshots * GHeadshotDamage(C) 
    BBodyshotDamageDone = DNumberOfBodyshots * HBodyshotDamage(C)
    CNumberOfHeadshots = EHeadshotChance(C) * FtotalShotsFired
    DNumberOfBodyshots = iBodyshotChance(C) * FtotalShotsFired
    FtotalShotsFired = CNumberOfHeadshots + DNumberOfBodyShots

    jNumberOfHeadshotsHit = (iBodyshotChance(C) * EHeadshotChance(C)) * FtotalShotsFired
    mPercentOfHeadshots = (iBodyshotChance(C) * EHeadshotChance(C))
    lPercentOfBodyshots = 1 - (iBodyshotChance(C) * EHeadshotChance(C))
    kNumberOfBodyshotsHit = FtotalShotsFired - jNumberOfHeadshotsHit
    FtotalShotsFired = jNumberOfHeadshotsHit + kNumberOfBodyshotsHit
    */

    var headshotDamage = selectedWeapon.damage + selectedWeapon.damage * 0.5;
    //headshotChance Exists IRL as the number of shots hit that were headshots i.e headshotsHit/shotsHit = headshotChance
    //It can also be the number of headshots hit out of your total shots fired i.e headshotsHit/totalShotsFired = headshotChance
    var headshotChance = headShotPercentSliderValue / 100;
    var hitChance = chanceToHit / 100;
    //2nd attempt
    //shotsHit = hp / (-headshotChance * baseDamage + headshotChance * headshotDamage + headshotChance);
    // var headshotDamage = selectedWeapon.damage + selectedWeapon.damage * 0.5;
    // var negativeHeadshotChance = headshotChance * -1;
    // var priorToTotalHealthDivision = ((negativeHeadshotChance * selectedWeapon.damage) + (headshotChance * headshotDamage) + selectedWeapon.damage);
    // var actualCalculation = enemyTotalHealth/priorToTotalHealthDivision;
    // var shotsHit = Math.ceil(actualCalculation);
    //var ttk = shotsHit / selectedWeapon.fireRate;

    //currently Only works for "out of total shots hit"
    var bodyShotsRequiredToKill = enemyTotalHealth / selectedWeapon.damage 
    var bodyshotsFiredIfAllBodyShots = Math.round(bodyShotsRequiredToKill * (1 + hitChance)); //??Math.ceil(bodyShotsTakenToKill * (hitChance) or Math.floor(bodyShotsTakenToKill * (hitChance)??
    var headshotsHit = Math.ceil(bodyShotsRequiredToKill * headshotChance);  //Could be floor or ceil should be opisite of body shot rounding
    var numberOfHeadshotsRequiredToIncreaseDamageDoneByAtLeastABodyShot = selectedWeapon.damage/(headshotDamage - selectedWeapon.damage)
    var lessBodyshotsBasedOnHeadshots = Math.floor(headshotsHit / numberOfHeadshotsRequiredToIncreaseDamageDoneByAtLeastABodyShot);
    var bodyshotsFired = (bodyshotsFiredIfAllBodyShots - headshotsHit) - lessBodyshotsBasedOnHeadshots;
    //might be neccissary one day
    var headshotDamageDone = headshotsHit * headshotDamage;
    var bodyshotDamageDone = (bodyShotsRequiredToKill - headshotsHit) * selectedWeapon.damage;
    var totalDamageDone = headshotDamageDone + bodyshotDamageDone;

    var shotsFired = this.calculateHeadShotsHitAndBodyShotsFiredToKillATarget(enemyTotalHealth, selectedWeapon.damage, headShotPercentSliderValue, chanceToHit);
    var ttk = (shotsFired.bodyshots + shotsFired.headshots) / selectedWeapon.fireRate;

    //var ttk = (headshotsHit + bodyshotsFired) / selectedWeapon.fireRate;

    //Original
    // var rawTTK = enemyTotalHealth / dps;
    // var TTKTimesFR = rawTTK * fireRate;
    // return Math.ceil(TTKTimesFR) / fireRate;
    return ttk;
  };

  setClassButtonColor = (className) => {
    var color;

    switch(className.toLowerCase()) {
      case "mage":
        color = "btn-info";
        break;
      case "assasin":
        color = "btn-dark";
        break;
      case "hunter":
        color = "btn-success";
        break;
      case "warrior":
        color = "btn-danger";
        break;
      default:
        color = "btn-link";
    }

    return color;
  };

  validateEnteredPercentChance = (value) => {
    var result = value.length != "" && !isNaN(value) && Number.isInteger(+value) && value >= 0 && value <= 100;
    if(result) {
      this.setState({editableDivColor1: "text-dark"});
    } else {
      this.setState({editableDivColor1: "text-danger"});

    }
    return result;
  };

  validateEnteredEnemyHealth = (value) => {
    var result = value.length != "" && !isNaN(value) && Number.isInteger(+value) && value >= 0 && value <= 3200;
    if(result) {
      this.setState({editableDivColor1: "text-dark"});
    } else {
      this.setState({editableDivColor1: "text-danger"});

    }
    return result;
  };

  loadAllLocalImages = () => {
    
  }

  render() {
    let EditableDiv = contentEditable("div");
    const {
      choiceColumnInfo,
      dataToLoadName,
      selectedWeapon,
      selectedRunes,
      selectedTalents,
      selectedAbilities,
      headShotPercentSliderValue,
      totalEnemyHealth,
      selectedClass,
      classData,
      chanceToHit,
    } = this.state;
    const calculatedInfoInitialState = [
      <CalculatedInfo
        text={"DPS"}
        value={this.formatNumberByTwoDecimalPoints(this.calculateDPS(
          selectedWeapon,
          selectedTalents,
          selectedRunes,
          headShotPercentSliderValue,
          chanceToHit,
        ))}
        unit={""}
      />,
      <CalculatedInfo
        text={"Damage Per Minute"}
        value={this.formatNumberByTwoDecimalPoints(this.calculateDPM(
          selectedWeapon,
          selectedTalents,
          selectedRunes,
          headShotPercentSliderValue,
          chanceToHit,
        ))}
        unit={""}
      />,
      <CalculatedInfo
        text={"Base Weapon Damage"}
        value={selectedWeapon.damage}
        unit={""}
      />,
      <CalculatedInfo
        text={"Base Weapon Damage After Modifiers"}
        value={this.calculateBaseDamageAfterModifiers(
          selectedWeapon,
          selectedTalents,
          selectedRunes,
          headShotPercentSliderValue
        )}
        unit={""}
      />,
      <CalculatedInfo
        text={"Headshot Damage"}
        value={this.calculateHeadshotDamage(
          selectedWeapon,
          selectedTalents,
          selectedRunes,
        )}
        unit={""}
      />,
      <CalculatedInfo
        text={"Fire Rate"}
        value={selectedWeapon.fireRate}
        unit={""}
      />,
      <CalculatedInfo
        text={"Time To Kill"}
        value={this.formatNumberByTwoDecimalPoints(this.calculateTTK(         
          totalEnemyHealth,
          selectedWeapon,
          headShotPercentSliderValue,
          chanceToHit,
        ))}
        unit={"Seconds"}
      />
    ];

    return (
      <div className="container containerForSimulator">
        <br />
        <h3 className="mx-auto" style={{ width: 478 + "px" }}>
          Objective Weapon Damage Simulator
        </h3>
        <br />
        <div className="row border border-secondary">
          <div className="col slider border border-secondary">
            <div align="center">Head Shot Chance</div>
            <div className="slider-horizontal">
              <Slider
                value={headShotPercentSliderValue}
                min={0}
                max={100}
                step={1}
                orientation="horizontal"
                onChange={this.handleHeadShotPercentSliderOnChange}
              />
            </div>
            <div className="value" align="center">
              <EditableDiv className={"editableDiv pl-2 pr-2 mb-1 mt-0" }  value={headShotPercentSliderValue} onSave={this.handleHeadShotPercentSliderOnChange} validation={this.validateEnteredPercentChance} />
            </div>
          </div>
          <div className="col slider border border-secondary">
            <div align="center">Enemy Health And Armour</div>
            <div className="slider-horizontal">
              <Slider
                value={totalEnemyHealth}
                min={0}
                max={3200}
                step={1}
                orientation="horizontal"
                onChange={this.handleTotalEnemyHealthSliderOnChange}
              />
            </div>
            <div className="value" align="center">
              <EditableDiv className={"editableDiv pl-2 pr-2 mb-1 mt-0"}  value={totalEnemyHealth} onSave={this.handleTotalEnemyHealthSliderOnChange} validation={this.validateEnteredEnemyHealth} />
            </div>
          </div>
          <div className="col slider border border-secondary">
            <div align="center">Chance to Hit</div>
            <div className="slider-horizontal">
              <Slider
                value={chanceToHit}
                min={0}
                max={100}
                step={1}
                orientation="horizontal"
                onChange={this.handleChanceToHitSliderOnChange}
              />
            </div>
            <div className="value" align="center">
              <EditableDiv className={"editableDiv pl-2 pr-2 mb-1 mt-0"}  value={chanceToHit} onSave={this.handleChanceToHitSliderOnChange} validation={this.validateEnteredPercentChance} />
            </div>
          </div>
          <div className="col-md-3 m-0 p-0 border border-secondary" align="center">
            Class
            <ClassSelecter classes={classData} setFunction={this.setSelectedClass} setClassButtonColor={this.setClassButtonColor} selectedRealmClass={selectedClass}/>
          </div>
        </div>
        <div className="container p-0">
          <div className="row mainContentRow">
            <ChoiceContainerColumn
              title={choiceColumnInfo.title}
              options={this.getDataByName(dataToLoadName).map(dat => (
                <Choice
                  choice={dat}
                  choiceType={choiceColumnInfo.title}
                  setFunction={this.setSelectedChoice}
                  getImageById={this.getImageById}
                />
              ))}
              buttonLeftTitle={choiceColumnInfo.leftButtonTitle}
              buttonRightTitle={choiceColumnInfo.rightButtonTitle}
              choiceButtonClicked={this.choiceButtonClicked}
            />
            <div className="col border border-secondary">
              <InfoHeader
                weapon={selectedWeapon}
                abilities={this.createSelecteableListAsString(selectedAbilities)}
                class={selectedClass}
                talents={this.createSelecteableListAsString(selectedTalents)}
                runes={this.createSelecteableListAsString(selectedRunes)}
                resetFunction={this.resetChoices}
              />
              {calculatedInfoInitialState}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
