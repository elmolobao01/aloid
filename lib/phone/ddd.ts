export type DDDInfo = {
  state: string;
  stateName: string;
  macroRegion: 'Norte' | 'Nordeste' | 'Centro-Oeste' | 'Sudeste' | 'Sul';
  areaReference: string;
};

/**
 * Referência geográfica por DDD.
 *
 * Importante:
 * - DDD identifica uma área de numeração, não a localização atual do aparelho/titular.
 * - areaReference é apenas uma descrição resumida da área atendida pelo código.
 * - A localidade confirmada da linha deve vir futuramente de um provider telecom.
 */
const DDD: Record<string, DDDInfo> = {
  // São Paulo
  '11': { state: 'SP', stateName: 'São Paulo', macroRegion: 'Sudeste', areaReference: 'São Paulo e região metropolitana' },
  '12': { state: 'SP', stateName: 'São Paulo', macroRegion: 'Sudeste', areaReference: 'Vale do Paraíba e litoral norte' },
  '13': { state: 'SP', stateName: 'São Paulo', macroRegion: 'Sudeste', areaReference: 'Baixada Santista e litoral sul' },
  '14': { state: 'SP', stateName: 'São Paulo', macroRegion: 'Sudeste', areaReference: 'Bauru, Marília e região' },
  '15': { state: 'SP', stateName: 'São Paulo', macroRegion: 'Sudeste', areaReference: 'Sorocaba e sudoeste paulista' },
  '16': { state: 'SP', stateName: 'São Paulo', macroRegion: 'Sudeste', areaReference: 'Ribeirão Preto, Franca e região' },
  '17': { state: 'SP', stateName: 'São Paulo', macroRegion: 'Sudeste', areaReference: 'São José do Rio Preto e região' },
  '18': { state: 'SP', stateName: 'São Paulo', macroRegion: 'Sudeste', areaReference: 'Presidente Prudente e oeste paulista' },
  '19': { state: 'SP', stateName: 'São Paulo', macroRegion: 'Sudeste', areaReference: 'Campinas, Piracicaba e região' },

  // Rio de Janeiro / Espírito Santo
  '21': { state: 'RJ', stateName: 'Rio de Janeiro', macroRegion: 'Sudeste', areaReference: 'Rio de Janeiro e região metropolitana' },
  '22': { state: 'RJ', stateName: 'Rio de Janeiro', macroRegion: 'Sudeste', areaReference: 'Campos, Macaé e norte fluminense' },
  '24': { state: 'RJ', stateName: 'Rio de Janeiro', macroRegion: 'Sudeste', areaReference: 'Volta Redonda, Petrópolis e região' },
  '27': { state: 'ES', stateName: 'Espírito Santo', macroRegion: 'Sudeste', areaReference: 'Vitória, região metropolitana e norte capixaba' },
  '28': { state: 'ES', stateName: 'Espírito Santo', macroRegion: 'Sudeste', areaReference: 'Cachoeiro de Itapemirim e sul capixaba' },

  // Minas Gerais
  '31': { state: 'MG', stateName: 'Minas Gerais', macroRegion: 'Sudeste', areaReference: 'Belo Horizonte e região central' },
  '32': { state: 'MG', stateName: 'Minas Gerais', macroRegion: 'Sudeste', areaReference: 'Juiz de Fora e Zona da Mata' },
  '33': { state: 'MG', stateName: 'Minas Gerais', macroRegion: 'Sudeste', areaReference: 'Governador Valadares e leste mineiro' },
  '34': { state: 'MG', stateName: 'Minas Gerais', macroRegion: 'Sudeste', areaReference: 'Uberlândia e Triângulo Mineiro' },
  '35': { state: 'MG', stateName: 'Minas Gerais', macroRegion: 'Sudeste', areaReference: 'Sul e sudoeste de Minas' },
  '37': { state: 'MG', stateName: 'Minas Gerais', macroRegion: 'Sudeste', areaReference: 'Divinópolis e centro-oeste mineiro' },
  '38': { state: 'MG', stateName: 'Minas Gerais', macroRegion: 'Sudeste', areaReference: 'Montes Claros e norte de Minas' },

  // Paraná / Santa Catarina
  '41': { state: 'PR', stateName: 'Paraná', macroRegion: 'Sul', areaReference: 'Curitiba e região metropolitana' },
  '42': { state: 'PR', stateName: 'Paraná', macroRegion: 'Sul', areaReference: 'Ponta Grossa, Guarapuava e região' },
  '43': { state: 'PR', stateName: 'Paraná', macroRegion: 'Sul', areaReference: 'Londrina e norte do Paraná' },
  '44': { state: 'PR', stateName: 'Paraná', macroRegion: 'Sul', areaReference: 'Maringá e noroeste do Paraná' },
  '45': { state: 'PR', stateName: 'Paraná', macroRegion: 'Sul', areaReference: 'Cascavel, Foz do Iguaçu e oeste do Paraná' },
  '46': { state: 'PR', stateName: 'Paraná', macroRegion: 'Sul', areaReference: 'Pato Branco e sudoeste do Paraná' },
  '47': { state: 'SC', stateName: 'Santa Catarina', macroRegion: 'Sul', areaReference: 'Joinville, Blumenau e norte catarinense' },
  '48': { state: 'SC', stateName: 'Santa Catarina', macroRegion: 'Sul', areaReference: 'Florianópolis e sul catarinense' },
  '49': { state: 'SC', stateName: 'Santa Catarina', macroRegion: 'Sul', areaReference: 'Chapecó e oeste catarinense' },

  // Rio Grande do Sul
  '51': { state: 'RS', stateName: 'Rio Grande do Sul', macroRegion: 'Sul', areaReference: 'Porto Alegre e região metropolitana' },
  '53': { state: 'RS', stateName: 'Rio Grande do Sul', macroRegion: 'Sul', areaReference: 'Pelotas e sul gaúcho' },
  '54': { state: 'RS', stateName: 'Rio Grande do Sul', macroRegion: 'Sul', areaReference: 'Caxias do Sul e serra gaúcha' },
  '55': { state: 'RS', stateName: 'Rio Grande do Sul', macroRegion: 'Sul', areaReference: 'Santa Maria e oeste gaúcho' },

  // Centro-Oeste / Tocantins
  '61': { state: 'DF', stateName: 'Distrito Federal', macroRegion: 'Centro-Oeste', areaReference: 'Distrito Federal e entorno' },
  '62': { state: 'GO', stateName: 'Goiás', macroRegion: 'Centro-Oeste', areaReference: 'Goiânia e região central de Goiás' },
  '63': { state: 'TO', stateName: 'Tocantins', macroRegion: 'Norte', areaReference: 'Palmas e demais regiões do Tocantins' },
  '64': { state: 'GO', stateName: 'Goiás', macroRegion: 'Centro-Oeste', areaReference: 'Rio Verde e sul de Goiás' },
  '65': { state: 'MT', stateName: 'Mato Grosso', macroRegion: 'Centro-Oeste', areaReference: 'Cuiabá e região' },
  '66': { state: 'MT', stateName: 'Mato Grosso', macroRegion: 'Centro-Oeste', areaReference: 'Rondonópolis, Sinop e interior de Mato Grosso' },
  '67': { state: 'MS', stateName: 'Mato Grosso do Sul', macroRegion: 'Centro-Oeste', areaReference: 'Campo Grande e demais regiões do estado' },

  // Norte
  '68': { state: 'AC', stateName: 'Acre', macroRegion: 'Norte', areaReference: 'Rio Branco e demais regiões do Acre' },
  '69': { state: 'RO', stateName: 'Rondônia', macroRegion: 'Norte', areaReference: 'Porto Velho e demais regiões de Rondônia' },

  // Bahia / Sergipe
  '71': { state: 'BA', stateName: 'Bahia', macroRegion: 'Nordeste', areaReference: 'Salvador e região metropolitana' },
  '73': { state: 'BA', stateName: 'Bahia', macroRegion: 'Nordeste', areaReference: 'Ilhéus, Itabuna, Porto Seguro e sul da Bahia' },
  '74': { state: 'BA', stateName: 'Bahia', macroRegion: 'Nordeste', areaReference: 'Juazeiro e centro-norte da Bahia' },
  '75': { state: 'BA', stateName: 'Bahia', macroRegion: 'Nordeste', areaReference: 'Feira de Santana e recôncavo baiano' },
  '77': { state: 'BA', stateName: 'Bahia', macroRegion: 'Nordeste', areaReference: 'Vitória da Conquista, Barreiras e oeste/sudoeste da Bahia' },
  '79': { state: 'SE', stateName: 'Sergipe', macroRegion: 'Nordeste', areaReference: 'Aracaju e demais regiões de Sergipe' },

  // Nordeste
  '81': { state: 'PE', stateName: 'Pernambuco', macroRegion: 'Nordeste', areaReference: 'Recife e região metropolitana' },
  '82': { state: 'AL', stateName: 'Alagoas', macroRegion: 'Nordeste', areaReference: 'Maceió e demais regiões de Alagoas' },
  '83': { state: 'PB', stateName: 'Paraíba', macroRegion: 'Nordeste', areaReference: 'João Pessoa, Campina Grande e região' },
  '84': { state: 'RN', stateName: 'Rio Grande do Norte', macroRegion: 'Nordeste', areaReference: 'Natal e demais regiões do Rio Grande do Norte' },
  '85': { state: 'CE', stateName: 'Ceará', macroRegion: 'Nordeste', areaReference: 'Fortaleza e região metropolitana' },
  '86': { state: 'PI', stateName: 'Piauí', macroRegion: 'Nordeste', areaReference: 'Teresina e norte do Piauí' },
  '87': { state: 'PE', stateName: 'Pernambuco', macroRegion: 'Nordeste', areaReference: 'Petrolina, Caruaru e interior de Pernambuco' },
  '88': { state: 'CE', stateName: 'Ceará', macroRegion: 'Nordeste', areaReference: 'Juazeiro do Norte, Sobral e interior do Ceará' },
  '89': { state: 'PI', stateName: 'Piauí', macroRegion: 'Nordeste', areaReference: 'Picos e sul do Piauí' },

  // Pará / Amazonas / demais Norte
  '91': { state: 'PA', stateName: 'Pará', macroRegion: 'Norte', areaReference: 'Belém e nordeste do Pará' },
  '92': { state: 'AM', stateName: 'Amazonas', macroRegion: 'Norte', areaReference: 'Manaus e região central do Amazonas' },
  '93': { state: 'PA', stateName: 'Pará', macroRegion: 'Norte', areaReference: 'Santarém e oeste do Pará' },
  '94': { state: 'PA', stateName: 'Pará', macroRegion: 'Norte', areaReference: 'Marabá e sudeste do Pará' },
  '95': { state: 'RR', stateName: 'Roraima', macroRegion: 'Norte', areaReference: 'Boa Vista e demais regiões de Roraima' },
  '96': { state: 'AP', stateName: 'Amapá', macroRegion: 'Norte', areaReference: 'Macapá e demais regiões do Amapá' },
  '97': { state: 'AM', stateName: 'Amazonas', macroRegion: 'Norte', areaReference: 'Interior do Amazonas' },

  // Maranhão
  '98': { state: 'MA', stateName: 'Maranhão', macroRegion: 'Nordeste', areaReference: 'São Luís e norte do Maranhão' },
  '99': { state: 'MA', stateName: 'Maranhão', macroRegion: 'Nordeste', areaReference: 'Imperatriz e sul do Maranhão' },
};

export function lookupDDD(ddd: string): DDDInfo | null {
  return DDD[ddd] ?? null;
}
