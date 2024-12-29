import { useState } from "react";
import { SubmitHandler, useForm, Validate } from 'react-hook-form';
import Form from 'react-bootstrap/Form';

import { useMutation } from "@tanstack/react-query";

import { createSchedule } from "../../api/apiSchedule";
import { navigateToSchedule } from "../../utils/router";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { Row, Col, Button, Spinner } from "react-bootstrap";

import { emitToast, ToastType } from "../notifications";

import '../../styles/filenew.scss';

import { timeFormatKey, startTimeOptions, endTimeOptions } from '../../utils/time';
import { ScheduleSettings } from "../forms";

interface FileNewModalProps {
    handleCancel: () => void
}

export function FileNewModal({ handleCancel }: FileNewModalProps) {

    const navigate = useNavigate();

    const [saving, setSaving] = useState(false);

    const mutation = useMutation({
        mutationFn: createSchedule,
        onSuccess: async (id) => {
            setSaving(false);
            reset();

            // console.log(id);

            navigateToSchedule(navigate, id);
            handleCancel();

            emitToast("Created schedule", ToastType.Success)
        },
        onError: (error) => {
            setSaving(false);

            handleCancel();

            emitToast(`Error creating schedule: ${error.message}`, ToastType.Error);
        },
        onMutate: async () => {
            setSaving(true);
        }
    });

    const defaultStartTime = moment();
    const defaultEndTime = moment();

    defaultStartTime.hours(7);
    defaultStartTime.minutes(0);

    defaultEndTime.hours(23);
    defaultEndTime.minutes(0);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<ScheduleSettings>({
        defaultValues: {
            startTime: timeFormatKey(defaultStartTime),
            endTime: timeFormatKey(defaultEndTime),
            name: "",
        }
    });

    const onSubmit: SubmitHandler<ScheduleSettings> = async (data) => {
        setSaving(true);

        // let timeDiff = moment(data.endTime, 'hh:mm AA').diff(moment(data.startTime, 'hh:mm AA'), 'hours', true);

        let dayStart = moment(`${data.startTime} ${data.startDate}`, "hh:mm AA YYYY-MM-DD");
        let dayEnd = moment(`${data.endTime} ${data.startDate}`, "hh:mm AA YYYY-MM-DD");
        dayEnd.add(30,'minutes');

        let numDays = moment(data.endDate, 'YYYY-MM-DD').diff(moment(data.startDate, 'YYYY-MM-DD'), 'days') + 1;
        let startDates = [];
        let endDates = [];

        for(let i=0; i<numDays; ++i) {

            startDates.push(dayStart.toISOString());
            endDates.push(dayEnd.toISOString());

            dayStart.add(1, 'days');
            dayEnd.add(1, 'days');
        }

        // console.log(startDates);
        // console.log(endDates);

        mutation.mutate({
            name: data.name ?? "",
            startDates: startDates,
            endDates: endDates
        });
    };

    const validateTimes: Validate<string | undefined, ScheduleSettings> = (_, formValues) => {
        let startTime = moment(formValues.startTime, "hh:mm A");
        let endTime = moment(formValues.endTime, "hh:mm A");

        return startTime && endTime && startTime.diff(endTime) < 0;
    }

    const validateDates: Validate<string | undefined, ScheduleSettings> = (_, formValues) => {
        let startDate = moment(formValues.startDate, "YYYY-MM-DD");
        let endDate = moment(formValues.endDate, "YYYY-MM-DD");

        // return startDate && endDate && (startDate.diff(endDate) < 0 && endDate.diff(startDate,'days') <= 7);
        return startDate.isValid() && endDate.isValid() && startDate.diff(endDate) < 0 && endDate.diff(startDate, 'days') <= 7;
    }

    return (
        <div>
            <Form noValidate onSubmit={handleSubmit(onSubmit)}>
                <Form.Group className="form-group">
                    <Form.Label>Name</Form.Label>
                    <Form.Control placeholder="Name the schedule..." {...register("name", { required: true })} isInvalid={!!errors.name} />
                    <Form.Control.Feedback type="invalid">
                        Please enter a name.
                    </Form.Control.Feedback>
                </Form.Group>
                <Row>
                    <Col>
                        <Form.Group className="form-group">
                            <Form.Label>Start Date</Form.Label>
                            <Form.Control type="date" {...register("startDate", { validate: validateDates })} isInvalid={!!errors.startDate} />
                            <Form.Control.Feedback type="invalid">
                                Please select a date. Start date must be before end date.
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group className="form-group">
                            <Form.Label>End Date</Form.Label>
                            <Form.Control type="date" {...register("endDate", { validate: validateDates })} isInvalid={!!errors.endDate} />
                            <Form.Control.Feedback type="invalid">
                                Please select a date. End date must be after start date by no more than 7 days.
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group className="form-group">
                            <Form.Label>Start Time</Form.Label>
                            <Form.Select {...register("startTime", {
                                validate: validateTimes
                            })}
                                isInvalid={!!errors.startTime}

                            >
                                {startTimeOptions.map((el, _) => <option key={timeFormatKey(el)} value={timeFormatKey(el)}>{el.format("h:mm A")}</option>)}
                            </Form.Select>
                            <Form.Text>The time that the schedule should start from each day</Form.Text>
                            <Form.Control.Feedback type="invalid">
                                Start time should be before end time.
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group className="form-group">
                            <Form.Label>End Time</Form.Label>
                            <Form.Select {...register("endTime", { required: true })} isInvalid={!!errors.startTime}>
                                {endTimeOptions.map((el, _) => <option key={timeFormatKey(el)} value={timeFormatKey(el)}>{el.format("h:mm A")}</option>)}
                            </Form.Select>
                            <Form.Text>The time that the schedule should end at each day</Form.Text>
                            <Form.Control.Feedback type="invalid">
                                End time should be after start time.
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row>
                {/* <Form.Group>
                    {/* <Form.Label>Active</Form.Label> 
                    <Form.Check {...register("active")} type="checkbox" label="Active?" />
                    <Form.Text>
                        Check the box to indicate that this schedule is the current working schedule for the upcoming RYLA season.
                        Only one schedule should be active at a time.

                    </Form.Text>
                </Form.Group> */}
                <div className="modal-footer-div">

                    <Button onClick={handleCancel} variant="light">
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" disabled={saving}>
                        {saving ?
                            <Spinner as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                style={{ marginRight: "5px" }}
                            /> : <></>
                        }
                        Create
                    </Button>
                </div>
            </Form>
        </div>
    )
}