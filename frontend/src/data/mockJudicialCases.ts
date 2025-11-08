import { JudicialCase } from '../types';

// ============================================
// DENUNCIAS / CASOS JUDICIALES
// ============================================
export const mockJudicialCases: JudicialCase[] = [
  // Denuncias contra María Elena Sánchez
  {
    id: '1',
    candidate_id: '1',
    case_title: 'Investigación por presunto conflicto de intereses',
    description: 'Denuncia presentada por ONG que cuestiona su participación en licitaciones cuando era Ministra de Economía. La investigación preliminar no encontró evidencia suficiente y fue archivada por la Fiscalía en 2022.',
    status: 'Archivado',
    source_url: 'https://elcomercio.pe/politica/caso-sanchez-archivado',
    date_filed: '2021-03-15',
    created_at: '2021-03-15T10:00:00',
  },

  // Denuncias contra Carlos Mendoza
  {
    id: '2',
    candidate_id: '2',
    case_title: 'Acusación por enriquecimiento ilícito',
    description: 'Caso abierto en 2023 por presunto incremento patrimonial no justificado durante sus años como congresista. Mendoza presentó documentación de ingresos por consultorías privadas. El caso está en etapa de investigación preparatoria.',
    status: 'En investigación',
    source_url: 'https://larepublica.pe/politica/mendoza-investigacion-fiscal',
    date_filed: '2023-06-20',
    created_at: '2023-06-20T14:30:00',
  },
  {
    id: '3',
    candidate_id: '2',
    case_title: 'Denuncia por cohecho pasivo',
    description: 'Acusación de haber recibido aportes de campaña no declarados de empresas constructoras en 2020. Mendoza niega los cargos y afirma que son ataques políticos. El caso fue derivado a la Comisión de Fiscalización del Congreso.',
    status: 'En trámite congresual',
    source_url: 'https://rpp.pe/politica/congreso/mendoza-cohecho-denuncia',
    date_filed: '2024-02-10',
    created_at: '2024-02-10T09:15:00',
  },

  // Denuncias contra Jorge Pacheco
  {
    id: '4',
    candidate_id: '3',
    case_title: 'Investigación por irregularidades en obra pública',
    description: 'Contraloría investigó presuntas irregularidades en adjudicación de obras durante su gestión como Alcalde de Cusco. Se encontraron observaciones menores y se impuso una multa administrativa de S/. 50,000 que fue pagada.',
    status: 'Cerrado con sanción administrativa',
    source_url: 'https://gestion.pe/peru/contraloria-pacheco-cusco',
    date_filed: '2017-11-05',
    created_at: '2017-11-05T16:45:00',
  },
  {
    id: '5',
    candidate_id: '3',
    case_title: 'Denuncia por nepotismo',
    description: 'Acusación por haber contratado a familiares en puestos de confianza en la Municipalidad de Cusco. Pacheco argumentó que eran profesionales calificados. La denuncia fue desestimada por falta de elementos que configuren delito.',
    status: 'Desestimado',
    source_url: 'https://andina.pe/politica/pacheco-nepotismo-denuncia',
    date_filed: '2018-04-22',
    created_at: '2018-04-22T11:20:00',
  },

  // Denuncias contra Rafael Gutiérrez
  {
    id: '6',
    candidate_id: '4',
    case_title: 'Demanda laboral de ex trabajadores',
    description: 'Grupo de ex trabajadores de su empresa de restaurantes lo demandó por despido arbitrario y no pago de beneficios sociales. El caso fue resuelto mediante conciliación extrajudicial con pago de S/. 180,000 en 2022.',
    status: 'Resuelto por conciliación',
    source_url: 'https://larepublica.pe/economia/gutierrez-demanda-laboral',
    date_filed: '2021-09-14',
    created_at: '2021-09-14T13:50:00',
  },
  {
    id: '7',
    candidate_id: '4',
    case_title: 'Investigación tributaria por SUNAT',
    description: 'SUNAT investigó posible evasión tributaria en una de sus empresas por declaraciones inconsistentes en 2019-2020. Tras fiscalización, se determinó que hubo errores contables sin intención de evadir. Pagó multa de S/. 120,000 más intereses.',
    status: 'Cerrado con pago de multa',
    source_url: 'https://gestion.pe/economia/sunat-gutierrez-fiscalizacion',
    date_filed: '2020-05-08',
    created_at: '2020-05-08T10:30:00',
  },
  {
    id: '8',
    candidate_id: '4',
    case_title: 'Denuncia por discriminación laboral',
    description: 'Ex trabajadora denunció discriminación por embarazo y despido injustificado. Gutiérrez negó las acusaciones argumentando bajo rendimiento. El caso está en proceso judicial laboral desde hace 18 meses.',
    status: 'En proceso judicial',
    source_url: 'https://elcomercio.pe/economia/gutierrez-denuncia-discriminacion',
    date_filed: '2023-10-12',
    created_at: '2023-10-12T15:20:00',
  },

  // Denuncias contra Ana Torres
  {
    id: '9',
    candidate_id: '5',
    case_title: 'Denuncia por difamación',
    description: 'Empresario minero la denunció por difamación tras acusarlo públicamente de contaminación ambiental sin pruebas suficientes. Torres presentó estudios técnicos como sustento. El caso fue archivado por ejercicio legítimo del derecho a la crítica política.',
    status: 'Archivado',
    source_url: 'https://larepublica.pe/politica/torres-difamacion-archivado',
    date_filed: '2022-07-18',
    created_at: '2022-07-18T09:40:00',
  },
  {
    id: '10',
    candidate_id: '5',
    case_title: 'Investigación por financiamiento irregular de ONG',
    description: 'Contraloría investigó el manejo de fondos públicos en una ONG que ella dirigió entre 2015-2018. Se encontraron irregularidades menores en rendiciones de cuentas que fueron subsanadas. No se configuró responsabilidad penal.',
    status: 'Cerrado sin responsabilidad penal',
    source_url: 'https://gestion.pe/peru/contraloria-torres-ong',
    date_filed: '2019-03-25',
    created_at: '2019-03-25T14:15:00',
  },

  // Denuncias contra Fernando Castillo
  {
    id: '11',
    candidate_id: '6',
    case_title: 'Investigación por compras sobrevaloradas en pandemia',
    description: 'Fiscalía investigó compra de equipos médicos durante su gestión como Ministro de Salud en 2020. Se cuestionaron precios de ventiladores mecánicos. La investigación concluyó que los precios eran los del mercado internacional en contexto de pandemia. Caso archivado.',
    status: 'Archivado',
    source_url: 'https://elcomercio.pe/politica/castillo-compras-covid-archivado',
    date_filed: '2020-08-30',
    created_at: '2020-08-30T11:25:00',
  },
  {
    id: '12',
    candidate_id: '6',
    case_title: 'Denuncia por negligencia médica',
    description: 'Familia de paciente denunció presunta negligencia médica cuando Castillo era director de hospital en 2014. Junta médica concluyó que se siguieron todos los protocolos y que el desenlace fatal fue por complicaciones imprevisibles. Denuncia desestimada.',
    status: 'Desestimado',
    source_url: 'https://rpp.pe/salud/castillo-negligencia-medica-desestimado',
    date_filed: '2014-12-10',
    created_at: '2014-12-10T16:30:00',
  },

  // Casos adicionales de contexto
  {
    id: '13',
    candidate_id: '2',
    case_title: 'Querella por injuria y calumnia',
    description: 'Periodista lo demandó por haberlo acusado de recibir dinero de narcotraficantes para publicar notas en su contra. Mendoza no pudo probar sus acusaciones y fue condenado a disculpa pública y pago de S/. 30,000 por daños.',
    status: 'Condenado - Sentencia firme',
    source_url: 'https://larepublica.pe/politica/mendoza-condenado-injuria',
    date_filed: '2022-11-08',
    created_at: '2022-11-08T10:50:00',
  },
  {
    id: '14',
    candidate_id: '4',
    case_title: 'Investigación por financiamiento ilegal de campaña',
    description: 'ONPE investiga posibles aportes no declarados a su campaña congresal de 2020. Se identificaron transferencias sospechosas desde empresas fantasma. Gutiérrez afirma que fueron préstamos personales debidamente documentados. Investigación en curso.',
    status: 'En investigación - ONPE',
    source_url: 'https://elcomercio.pe/politica/onpe-gutierrez-financiamiento',
    date_filed: '2024-08-15',
    created_at: '2024-08-15T13:40:00',
  },
  {
    id: '15',
    candidate_id: '3',
    case_title: 'Denuncia por acoso político',
    description: 'Ex regidora de su gestión lo denunció por acoso político y discriminación de género. Pacheco rechazó las acusaciones y presentó testimonios de otras funcionarias que lo respaldan. El caso está en investigación preliminar en Fiscalía.',
    status: 'En investigación preliminar',
    source_url: 'https://rpp.pe/politica/pacheco-acoso-politico-denuncia',
    date_filed: '2024-03-22',
    created_at: '2024-03-22T11:15:00',
  },
];
