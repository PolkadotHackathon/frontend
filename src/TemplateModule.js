import React, { useEffect, useState } from 'react'
import { Form, Input, Grid, Card, Statistic } from 'semantic-ui-react'

import { useSubstrateState } from './substrate-lib'
import { TxButton } from './substrate-lib/components'

// WARNING: StorageType = {a: u32, b: u32} 

function formatStorageType(storageType) {
    return "StorageType = {" + storageType.a + ", " + storageType.b + "}"
}

function Main(props) {
    const { api } = useSubstrateState()

    // The transaction submission status
    const [status, setStatus] = useState('')

    // The currently stored value
    const [currentValue, setCurrentValue] = useState({ a: 0, b: 0 })
    const [formValue, setFormValue] = useState({ a: 0, b: 0 })

    useEffect(() => {
        let unsubscribe
        api.query.templateModule
            .something(newValue => {
                // The storage value is an Option<StorageType>
                // So we have to check whether it is None first
                // There is also unwrapOr
                if (newValue.isNone) {
                    setCurrentValue('<None>')
                } else {
                    setCurrentValue(newValue.unwrap())
                }
            })
            .then(unsub => {
                unsubscribe = unsub
            })
            .catch(console.error)

        return () => unsubscribe && unsubscribe()
    }, [api.query.templateModule])

    return (
        <Grid.Column width={8}>
            <h1>Template Module</h1>
            <Card centered>
                <Card.Content textAlign="center">
                    <Statistic label="Current Value" value={formatStorageType(currentValue)} />
                </Card.Content>
            </Card>
            <Form>
                <Form.Field>
                    <Input
                        label="New Value ('a b')"
                        state="newValue"
                        type="text"
                        onChange={(_, { value }) => setFormValue({
                            a: parseInt(value.split(' ')[0]),
                            b: parseInt(value.split(' ')[1])
                        })}
                    />
                </Form.Field>
                <Form.Field style={{ textAlign: 'center' }}>
                    <TxButton
                        label="Store Something"
                        type="SIGNED-TX"
                        setStatus={setStatus}
                        attrs={{
                            palletRpc: 'templateModule',
                            callable: 'doSomething',
                            inputParams: [formValue],
                            paramFields: [true],
                        }}
                    />
                </Form.Field>
                <div style={{ overflowWrap: 'break-word' }}>{status}</div>
            </Form>
        </Grid.Column>
    )
}

export default function TemplateModule(props) {
    const { api } = useSubstrateState()
    return api.query.templateModule && api.query.templateModule.something ? (
        <Main {...props} />
    ) : null
}
