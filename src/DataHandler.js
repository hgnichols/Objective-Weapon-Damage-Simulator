let loadRuneDataForClasses = (classes, talents) => {
  var copyOfClasses = classes.slice();
  var x;
  var y;

  for (x = 0; x < copyOfClasses.length; x++) {
    for (y = 0; y < talents.length; y++) {
      if (
        copyOfClasses[x].name.toUpperCase() === talents[y].class.toUpperCase()
      ) {
        copyOfClasses[x].availableRunes.push(talents[y]);
      }
    }
  }

  return copyOfClasses;
};

let loadData = async () => {
  var data = [];
  await Promise.all([
    getWeaponDataFromDb(),
    getTalentDataFromDb(),
    getRuneDataFromDb(),
    getClassDataFromDb()
  ]).then(function(values) {
    loadRuneDataForClasses(values[3].data, values[1].data);
    values.forEach(value => data.push(value.data));
  });
  return data;
};

let getWeaponDataFromDb = async () => {
  const data = await fetch("http://localhost:3001/api/getWeaponData");
  return await data.json();
};

let getTalentDataFromDb = async () => {
  const data = await fetch("http://localhost:3001/api/getTalentData");
  return await data.json();
};

let getRuneDataFromDb = async () => {
  const data = await fetch("http://localhost:3001/api/getRuneData");
  return await data.json();
};

let getClassDataFromDb = async () => {
  const data = await fetch("http://localhost:3001/api/getClassData");
  return await data.json();
};

export { loadData };
