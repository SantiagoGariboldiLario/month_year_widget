<div align="center">
  <h1>Month Year Datepicker</h1>
  <h4>Creates a new field widget to make Date fields work just with Month and Years</h4>
  <br>
  <p>
    <a href="https://github.com/JDavidMoreno/month_year_widget/blob/main/LICENSE">
        <img alt="license" src="https://img.shields.io/badge/license-MIT-green" />
    </a>
    <img alt="python version" src="https://img.shields.io/badge/python-3.5 | 3.6 | 3.7 | 3.8 | 3.9 -blue" />
    <img alt="odoo version" src="https://img.shields.io/badge/Odoo%20Version-19-success" />
  </p>
</div>

<div align="center">
  <table>
    <tr>
      <td><img alt="example field just months-years" src="https://github.com/JDavidMoreno/month_year_widget/blob/main/.github/images/widget_example.png" /></td>
    </tr>
  </table>
</div>

---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Motivation](#motivation)
- [Installation](#installation)
- [Usage](#usage)
- [Migration from Odoo 17 to Odoo 19](#migration-from-odoo-17-to-odoo-19)
- [License](#license)

## Motivation

Sometimes you don't really need to enter a specific day for a date in Odoo, probably you just need to know the month and the year. For cases like this, with this new widget you don't have to care about entering a random number for the day.

## Installation

Move this module to your addons folder. Then restart your Odoo server and, while in developer mode, click the button Update Apps List from the Apps addons.

## Usage

Once the module is installed, add it to the `__manifest__.py` of the module where you want to use it. Then, in the xml add the `widget='month_year_format'` (or `widget='month_year_widget'`).

![xml widget example](https://github.com/JDavidMoreno/month_year_widget/blob/main/.github/images/code_example.png)

## Migration from Odoo 17 to Odoo 19

- Removed the legacy datepicker stack (jQuery + Tempus Dominus + moment).
- Rebuilt the widget on OWL and the `datetime_picker` service (Luxon).
- Forced month precision via `minPrecision/maxPrecision = "months"` and a month/year format derived from the user locale.
- Assets are now loaded via `__manifest__.py` (`web.assets_backend`).

## License

This project is licensed under the terms of the
[MIT](https://choosealicense.com/licenses/mit/) license.

<div align="right">
  <b><a href="#month-year-datepicker">↥ back to top</a></b>
</div>
