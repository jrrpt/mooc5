const { log, biglog, errorlog, colorize } = require("./out");

const model = require("./model");

/**
 * Muestra la ayuda.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 */
exports.helpCmd = rl => {
  log("Commandos:");
  log("  h|help - Muestra esta ayuda.");
  log("  list - Listar los quizzes existentes.");
  log("  show <id> - Muestra la pregunta y la respuesta el quiz indicado.");
  log("  add - Añadir un nuevo quiz interactivamente.");
  log("  delete <id> - Borrar el quiz indicado.");
  log("  edit <id> - Editar el quiz indicado.");
  log("  test <id> - Probar el quiz indicado.");
  log("  p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
  log("  credits - Créditos.");
  log("  q|quit - Salir del programa.");
  rl.prompt();
};

/**
 * Lista todos los quizzes existentes en el modelo.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 */
exports.listCmd = rl => {
  model.getAll().forEach((quiz, id) => {
    log(` [${colorize(id, "magenta")}]:  ${quiz.question}`);
  });
  rl.prompt();
};

/**
 * Muestra el quiz indicado en el parámetro: la pregunta y la respuesta.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 * @param id Clave del quiz a mostrar.
 */
exports.showCmd = (rl, id) => {
  if (typeof id === "undefined") {
    errorlog(`Falta el parámetro id.`);
  } else {
    try {
      const quiz = model.getByIndex(id);
      log(
        ` [${colorize(id, "magenta")}]:  ${quiz.question} ${colorize(
          "=>",
          "magenta"
        )} ${quiz.answer}`
      );
    } catch (error) {
      errorlog(error.message);
    }
  }
  rl.prompt();
};

/**
 * Añade un nuevo quiz al módelo.
 * Pregunta interactivamente por la pregunta y por la respuesta.
 *
 * Hay que recordar que el funcionamiento de la funcion rl.question es asíncrono.
 * El prompt hay que sacarlo cuando ya se ha terminado la interacción con el usuario,
 * es decir, la llamada a rl.prompt() se debe hacer en la callback de la segunda
 * llamada a rl.question.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 */
exports.addCmd = rl => {
  rl.question(colorize(" Introduzca una pregunta: ", "red"), question => {
    rl.question(colorize(" Introduzca la respuesta ", "red"), answer => {
      model.add(question, answer);
      log(
        ` ${colorize("Se ha añadido", "magenta")}: ${question} ${colorize(
          "=>",
          "magenta"
        )} ${answer}`
      );
      rl.prompt();
    });
  });
};

/**
 * Borra un quiz del modelo.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 * @param id Clave del quiz a borrar en el modelo.
 */
exports.deleteCmd = (rl, id) => {
  if (typeof id === "undefined") {
    errorlog(`Falta el parámetro id.`);
  } else {
    try {
      model.deleteByIndex(id);
    } catch (error) {
      errorlog(error.message);
    }
  }
  rl.prompt();
};

/**
 * Edita un quiz del modelo.
 *
 * Hay que recordar que el funcionamiento de la funcion rl.question es asíncrono.
 * El prompt hay que sacarlo cuando ya se ha terminado la interacción con el usuario,
 * es decir, la llamada a rl.prompt() se debe hacer en la callback de la segunda
 * llamada a rl.question.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 * @param id Clave del quiz a editar en el modelo.
 */
exports.editCmd = (rl, id) => {
  if (typeof id === "undefined") {
    errorlog(`Falta el parámetro id.`);
    rl.prompt();
  } else {
    try {
      const quiz = model.getByIndex(id);

      process.stdout.isTTY &&
        setTimeout(() => {
          rl.write(quiz.question);
        }, 0);

      rl.question(colorize(" Introduzca una pregunta: ", "red"), question => {
        process.stdout.isTTY &&
          setTimeout(() => {
            rl.write(quiz.answer);
          }, 0);

        rl.question(colorize(" Introduzca la respuesta ", "red"), answer => {
          model.update(id, question, answer);
          log(
            ` Se ha cambiado el quiz ${colorize(
              id,
              "magenta"
            )} por: ${question} ${colorize("=>", "magenta")} ${answer}`
          );
          rl.prompt();
        });
      });
    } catch (error) {
      errorlog(error.message);
      rl.prompt();
    }
  }
};

/**
 * Prueba un quiz, es decir, hace una pregunta del modelo a la que debemos contestar.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 * @param id Clave del quiz a probar.
 */
exports.testCmd = (rl, id) => {
  try {
    let quiz = model.getByIndex(id);
    log(quiz.question + "?", "red");
    rl.question("", answer => {
      if (answer.toLowerCase() === quiz.answer.toLowerCase()) {
        log("Correcto", "green");
      } else {
        log("Incorrecto", "red");
      }
      rl.prompt();
    });
  } catch (error) {
    errorlog(error.message);
    rl.prompt();
  }
};

/**
 * Función que baraja o desordena un array de forma aleatoria.
 *
 * @param a Array a barajar o desordenar
 */
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Función que realiza una pregunta y devuelve un valor booleano indicando
 * si la respuesta ha sido correcta o no.
 *
 * @param p Objeto que contiene la pregunta a realizar
 */
function pregunta(p) {
  let correcto = true;

  log(p.question + "?", "red");

  return correcto;
}

/**
 * Pregunta todos los quizzes existentes en el modelo en orden aleatorio.
 * Se gana si se contesta a todos satisfactoriamente.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 */
exports.playCmd = rl => {
  let quizzes = model.getAll();
  let puntos = 0;
  let br = false;
  let element;

  shuffle(quizzes);

  for (let element of quizzes) {
    let acierto = pregunta(element);
    if (acierto) {
      puntos++;
      log("CORRECTO - Lleva " + puntos + " aciertos.", "green");
    } else {
      br = true;
      log("INCORRECTO", "red");
      break;
    }
  }
  if (!br) {
    log("No hay nada más que preguntar.", "white");
  }
  log("Fin del juego. Aciertos: " + puntos, "white");
  biglog(puntos, "magenta");
  rl.prompt();
};

/**
 * Muestra los nombres de los autores de la práctica.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 */
exports.creditsCmd = rl => {
  log("Autores de la práctica:");
  log("José Ramírez", "green");
  rl.prompt();
};

/**
 * Terminar el programa.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 */
exports.quitCmd = rl => {
  rl.close();
};
