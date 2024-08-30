/* -- TOOLS --------------------------------------------- */

/**
 * Check if the number is even.
 * @param {number} n input number
 * @returns {boolean} `true` if even else `false`
 */
const isEven = n => n % 2 === 0;

/**
 * Add event listenner to element.
 * @param {HTMLElement} e HTML element
 * @param {keyof HTMLElementEventMap} t event type
 * @param {(e: Event) => _} f callback function
 */
const sub = (e, t, f) => e.addEventListener(t, f)

/* -- HANDLE EVENT -------------------------------------- */

/**
 * Extract value from manual form.
 * @param {SubmitEvent} e manual form event
 * @returns {number} game size
 */
const getVal = e => e.target.size.value;

/**
 * Display error.
 * @param {SubmitEvent} e Stoppable Event
 * @param {HTMLDialogElement} d Displayed dialog
 */
const raise = (e, d) => (e.preventDefault(), d.showModal());

/**
 * SHow error if invalid input.
 * @param {SubmitEvent} e form event
 * @param {HTMLDialogElement} d displayed dialog if error
 */
const onSubmit = (e, d) =>
    !isEven(getVal(e)) ? raise(e, d) : _;

/* -- INIT ---------------------------------------------- */

/**
 * Manual settings form
 * @type {HTMLFormElement}
 */
const f = document.forms.manual;

/**
 * Error dialog
 * @type {HTMLDialogElement}
 */
const d = document.getElementById("error")

sub(f, "submit", e => onSubmit(e, d))
