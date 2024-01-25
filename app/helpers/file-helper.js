const performIntersection = (arr1, arr2) => {
  // converting into Set
  const setA = new Set(arr1);
  const setB = new Set(arr2);

  let intersectionResult = [];

  for (let i of setB) {
    if (!setA.has(i)) {
      intersectionResult.push(i);
    }
  }

  return intersectionResult;
};

const formatDate = (date) => {
  return new Date(date).toLocaleString('id-ID', {
    timeZone: 'UTC',
    dateStyle: 'long',
  });
};

const getInitials = (name) => {
  var parts = name.split(' ');
  var initials = '';
  for (var i = 0; i < parts.length; i++) {
    if (parts[i].length > 0 && parts[i] !== '') {
      initials += parts[i][0];
    }
  }
  return initials;
};

const containsWhitespace = (str) => {
  return /\s/.test(str);
};

const age = (birthdate) => {
  const today = new Date();
  const age =
    today.getFullYear() -
    birthdate.getFullYear() -
    (today.getMonth() < birthdate.getMonth() || (today.getMonth() === birthdate.getMonth() && today.getDate() < birthdate.getDate()));
  return age;
};

const makerandomchar = (length, nama) => {
  let result = '';
  const characters = nama;
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
};

module.exports = {
  performIntersection,
  formatDate,
  getInitials,
  age,
  containsWhitespace,
  makerandomchar,
};
