const express = require('express')();


try {
  require('express')().listen(3000, err => {
    console.log('listen');
  });
} catch (e) {

}
