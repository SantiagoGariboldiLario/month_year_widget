/** @odoo-module **/

import { onWillRender, useEffect, useRef, useState } from "@odoo/owl";
import { useDateTimePicker } from "@web/core/datetime/datetime_picker_hook";
import { areDatesEqual, formatDate } from "@web/core/l10n/dates";
import { localization } from "@web/core/l10n/localization";
import { _t } from "@web/core/l10n/translation";
import { registry } from "@web/core/registry";
import { FIELD_WIDTHS } from "@web/views/list/column_width_hook";
import { dateField, DateTimeField } from "@web/views/fields/datetime/datetime_field";

const { DateTime } = luxon;

function getMonthYearFormat(dateFormat) {
    const tokens = Array.from(dateFormat.matchAll(/(M+|L+|y+)/g), (match) => ({
        token: match[0],
        index: match.index ?? 0,
    }));
    const monthToken = tokens.find((token) => token.token.startsWith("M") || token.token.startsWith("L"));
    const yearToken = tokens.find((token) => token.token.startsWith("y"));

    if (!monthToken || !yearToken) {
        return "MM/yyyy";
    }

    const monthFirst = monthToken.index < yearToken.index;
    const first = monthFirst ? monthToken : yearToken;
    const second = monthFirst ? yearToken : monthToken;
    let separator = dateFormat.slice(first.index + first.token.length, second.index);
    separator = separator.replace(/[A-Za-z]/g, "");
    separator = separator.replace(/\s+/g, " ").replace(/([/.\-])\1+/g, "$1").trim();
    if (separator.length > 1) {
        const picked = separator.match(/[/.\-]/);
        separator = picked ? picked[0] : " ";
    }
    if (!separator) {
        separator = " ";
    }

    return monthFirst
        ? `${monthToken.token}${separator}${yearToken.token}`
        : `${yearToken.token}${separator}${monthToken.token}`;
}

export class MonthYearDateField extends DateTimeField {
    setup() {
        this.monthYearFormat = getMonthYearFormat(localization.dateFormat);

        const getPickerProps = () => {
            const value = this.getRecordValue();
            const pickerProps = {
                value,
                type: this.field.type,
                range: this.isRange(value),
                showRangeToggler:
                    this.relatedField && !this.props.required && !this.props.alwaysRange,
                onToggleRange,
            };
            if (this.props.maxDate) {
                pickerProps.maxDate = this.parseLimitDate(this.props.maxDate);
            }
            if (this.props.minDate) {
                pickerProps.minDate = this.parseLimitDate(this.props.minDate);
            }
            if (!isNaN(this.props.rounding)) {
                pickerProps.rounding = this.props.rounding;
            } else if (this.props.showSeconds) {
                pickerProps.rounding = 0;
            }
            if (this.props.maxPrecision) {
                pickerProps.maxPrecision = this.props.maxPrecision;
            }
            if (this.props.minPrecision) {
                pickerProps.minPrecision = this.props.minPrecision;
            }
            return pickerProps;
        };

        const onToggleRange = () => {
            this.state.range = !this.state.range;

            if (this.state.range) {
                let values = this.values;
                const optionalFieldIndex = values[0] ? 1 : 0;

                if (!values[0] && !values[1]) {
                    values = [DateTime.local(), DateTime.local()];
                }
                values[optionalFieldIndex] = optionalFieldIndex
                    ? values[0].plus({ hours: 1 })
                    : values[1].minus({ hours: 1 });

                this.state.focusedDateIndex = 0;
                this.state.value = values;
            } else {
                const mainFieldIndex = this.props.name === this.startDateField ? 0 : 1;

                this.state.focusedDateIndex = mainFieldIndex;
                this.state.value[mainFieldIndex ? 0 : 1] = false;
            }
        };

        const dateTimePicker = useDateTimePicker({
            target: "root",
            format: this.monthYearFormat,
            showSeconds: this.props.showSeconds,
            get pickerProps() {
                return getPickerProps();
            },
            onChange: () => {
                this.state.range = this.isRange(this.state.value);
            },
            onClose: () => {
                this.picker.activeInput = "";
                this.state.value = this.getRecordValue();
            },
            onApply: async () => {
                const toUpdate = {};
                if (Array.isArray(this.state.value)) {
                    [toUpdate[this.startDateField], toUpdate[this.endDateField]] = this.state.value;
                } else {
                    toUpdate[this.props.name] = this.state.value;
                }

                for (const fieldName in toUpdate) {
                    if (areDatesEqual(toUpdate[fieldName], this.props.record.data[fieldName])) {
                        delete toUpdate[fieldName];
                    }
                }

                if (Object.keys(toUpdate).length) {
                    await this.props.record.update(toUpdate);
                }
            },
        });
        this.state = useState(dateTimePicker.state);
        this.picker = useState({ activeInput: "" });
        this.openPicker = dateTimePicker.open;

        this.startDate = useRef("start-date");
        this.endDate = useRef("end-date");

        useEffect(
            () => {
                [this.startDate, this.endDate].forEach((ref, index) => {
                    if (ref.el?.getAttribute("data-field") === this.picker.activeInput) {
                        ref.el.focus();
                        this.openPicker(index);
                    }
                });
            },
            () => [this.startDate.el?.tagName, this.endDate.el?.tagName, this.picker.activeInput]
        );

        onWillRender(() => this.triggerIsDirty());

        this.futureWarningMsg = _t("This date is in the future");
    }

    getFormattedValue(valueIndex) {
        const values = this.values;
        const value = values[valueIndex];
        if (!value) {
            return "";
        }
        return formatDate(value, { format: this.monthYearFormat });
    }
}

const monthYearField = {
    ...dateField,
    component: MonthYearDateField,
    displayName: _t("Month/Year"),
    supportedOptions: dateField.supportedOptions.filter(
        (option) => !["min_precision", "max_precision"].includes(option.name)
    ),
    supportedTypes: ["date"],
    extractProps: (params, dynamicInfo) => ({
        ...dateField.extractProps(params, dynamicInfo),
        minPrecision: "months",
        maxPrecision: "months",
    }),
    listViewWidth: () => FIELD_WIDTHS.date,
};

registry.category("fields").add("month_year_format", monthYearField);
registry.category("fields").add("month_year_widget", monthYearField);
