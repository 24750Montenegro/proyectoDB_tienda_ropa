import { useMemo, useState } from 'react'
import { CsvButton } from '../components/CsvButton.jsx'
import { DataTable } from '../components/DataTable.jsx'
import { FormField } from '../components/FormField.jsx'
import { Notice } from '../components/Notice.jsx'
import { PageHeader } from '../components/PageHeader.jsx'
import { Section } from '../components/Section.jsx'
import { useApiResource } from '../hooks/useApiResource.js'

const reportOptions = [
  {
    id: 'top-productos',
    title: 'Top productos vendidos',
    description: 'Vista SQL con JOIN y agregaciones.',
    path: '/reportes/top-productos?limite=10',
    filename: 'top-productos.csv',
  },
  {
    id: 'bajo-stock',
    title: 'Productos bajo stock',
    description: 'VIEW usada por el backend para alimentar la UI.',
    path: '/reportes/productos-bajo-stock',
    filename: 'productos-bajo-stock.csv',
  },
  {
    id: 'clientes-categoria',
    title: 'Clientes por categoria',
    description: 'Subquery IN con varias tablas relacionadas.',
    path: '/reportes/clientes-por-categoria?categoria=Calzado',
    filename: 'clientes-categoria.csv',
  },
  {
    id: 'productos-promedio',
    title: 'Productos sobre promedio',
    description: 'Subquery correlacionada por categoria.',
    path: '/reportes/productos-sobre-promedio',
    filename: 'productos-sobre-promedio.csv',
  },
  {
    id: 'ingresos-categoria',
    title: 'Ingresos por categoria',
    description: 'GROUP BY, HAVING y funciones de agregacion.',
    path: '/reportes/ingresos-por-categoria?umbral=1000',
    filename: 'ingresos-categoria.csv',
  },
  {
    id: 'participacion',
    title: 'Participacion por producto',
    description: 'CTE con porcentaje sobre el total.',
    path: '/reportes/top-productos-participacion?limite=5',
    filename: 'participacion-productos.csv',
  },
]

export function ReportsPage() {
  const [selectedId, setSelectedId] = useState(reportOptions[0].id)
  const selectedReport = reportOptions.find((report) => report.id === selectedId)
  const report = useApiResource(selectedReport.path)

  const columns = useMemo(() => {
    if (!report.data.length) return []
    return Object.keys(report.data[0]).map((key) => ({
      key,
      label: key.replaceAll('_', ' '),
    }))
  }, [report.data])

  return (
    <>
      <PageHeader
        title="Reportes SQL"
        description="Consultas visibles en la UI para cumplir la categoria SQL del proyecto."
        actions={<CsvButton filename={selectedReport.filename} rows={report.data} disabled={report.loading} />}
      />
      <Notice type="error">{report.error}</Notice>
      <Section title="Seleccion de reporte" description={selectedReport.description}>
        <div className="report-picker">
          <FormField label="Reporte">
            <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
              {reportOptions.map((option) => (
                <option key={option.id} value={option.id}>{option.title}</option>
              ))}
            </select>
          </FormField>
        </div>
      </Section>
      <Section title={selectedReport.title}>
        <DataTable loading={report.loading} rows={report.data} columns={columns} />
      </Section>
    </>
  )
}
