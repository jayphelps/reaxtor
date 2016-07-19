const models = Observable.of(new Model());

<App models={models} keys={['id', 'url', 'title', 'total']}>
    <iFrame data-values='foo' keys={['url', 'total']}>{
        ({ url, total }, ...children) => (
            <iframe src={`${url}?total=${total}`}/>
    )}</iFrame>
    <Table>
        { /* Table Header */}
        <List id='foo' path='cols' keys='["total", "length"]'>{{
            child: (props) => (
                <Cell keys={['name']} { ...props }>{
                ({ name }) => (
                    <div class={{ [tableCellClassName]: true }}>
                        <input type='text' value={name} readonly='true' disabled='true'/>
                    </div>
                )}
                </Cell>
            ),
            render: ({ total, length }, ...cells) => (
                <thead class={{ [tableHeaderClassName]: true }}>
                    <tr>
                    {cells.concat(
                        <div class={{ [tableCellClassName]: true }}>
                            <span>{total}</span>
                            <i on-click={[this.onSpliceRow, undefined]} class={{ [spliceIconClassName]: true }}/>
                            <i on-click={[this.onInsertRow, undefined]} class={{ [insertIconClassName]: true }}/>
                        </div>
                    )
                    .map((cell) => (
                        <th style={{ width: `${Math.round(100 / (length + 1))}%` }}>
                            {cell}
                        </th>
                    ))}
                    </tr>
                </thead>
            )
        }}</List>
        {/* Table Body */}
        <List path='rows' keys={['length']}>
        {(state, ...rows) => (
            <tbody class={{ [tableBodyClassName]: true }}>
                {rows}
            </tbody>
        )}
        {(props) => (
            /* Table Rows */
            <List keys={['id', 'total', 'length']} {...props}>
            {(props) => (
                /* Table Cells*/
                <Cell keys={['value']} {...props}>
                {({ value }) => (
                    <div class={{ [tableCellClassName]: true }}>
                        <input type='number' value={name}/>
                    </div>
                )}
                </Cell>
            )}
            {({ id, total, length }, ...cells) => (
                <tr>
                {cells.concat(
                    <div class={{ [tableCellClassName]: true }}>
                        <span>{total}</span>
                        <i on-click={[this.onSpliceRow, id]} class={{ [spliceIconClassName]: true }}/>
                        <i on-click={[this.onInsertRow, id]} class={{ [insertIconClassName]: true }}/>
                    </div>
                )
                .map((cell) => (
                    <th style={{ width: `${Math.round(100 / (length + 1))}%` }}>
                        {cell}
                    </th>
                ))}
                </tr>
            )}
            </List>
        )}
        </List>
    </Table>
</App>
